#!/bin/sh
set -eu

data_dir=/var/www/data
seed_dir=/opt/ghc/seed
db_marker="$data_dir/.ghc-database-installed"
marker="$data_dir/.ghc-installed"

mkdir -p "$data_dir" /var/www/html/images

if [ ! -f "$data_dir/secrets.php" ]; then
    umask 077
    php -r '$secret = bin2hex(random_bytes(32)); $upgrade = bin2hex(random_bytes(16)); echo "<?php\n\$wgSecretKey = \"$secret\";\n\$wgUpgradeKey = \"$upgrade\";\n";' > "$data_dir/secrets.php"
fi

if [ ! -f "$db_marker" ]; then
    : "${MEDIAWIKI_ADMIN_USER:?MEDIAWIKI_ADMIN_USER is required}"
    : "${MEDIAWIKI_ADMIN_PASSWORD:?MEDIAWIKI_ADMIN_PASSWORD is required}"

    php maintenance/run.php installPreConfigured
    php maintenance/run.php createAndPromote \
        "$MEDIAWIKI_ADMIN_USER" "$MEDIAWIKI_ADMIN_PASSWORD" \
        --sysop --bureaucrat --interface-admin

    touch "$db_marker"
fi

if [ ! -f "$marker" ]; then
    : "${MEDIAWIKI_ADMIN_USER:?MEDIAWIKI_ADMIN_USER is required}"

    while IFS='|' read -r title file; do
        case "$title" in
            ''|'#'*) continue ;;
        esac
        php maintenance/run.php edit \
            -u "$MEDIAWIKI_ADMIN_USER" \
            -s '导入国豪野史初始内容' \
            "$title" < "$seed_dir/pages/$file"
    done < "$seed_dir/manifest.txt"

    touch "$marker"
fi

chown -R www-data:www-data "$data_dir" /var/www/html/images
exec docker-php-entrypoint "$@"
