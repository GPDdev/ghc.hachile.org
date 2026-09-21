FROM mediawiki:1.46.0

RUN a2enmod rewrite \
    && printf '%s\n' \
      '<Directory /var/www/html>' \
      '    AllowOverride None' \
      '    Options FollowSymLinks' \
      '    Require all granted' \
      '</Directory>' \
      'RewriteEngine On' \
      'RewriteRule ^/?wiki(/.*)?$ /index.php [L]' \
      > /etc/apache2/conf-available/ghc.conf \
    && a2enconf ghc

COPY LocalSettings.php /var/www/html/LocalSettings.php
COPY docker/entrypoint.sh /usr/local/bin/ghc-entrypoint
COPY seed/ /opt/ghc/seed/
COPY assets/ /var/www/html/resources/ghc/

RUN chmod +x /usr/local/bin/ghc-entrypoint

ENTRYPOINT ["/usr/local/bin/ghc-entrypoint"]
CMD ["apache2-foreground"]

