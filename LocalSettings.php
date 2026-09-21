<?php

if ( !defined( 'MEDIAWIKI' ) ) {
	exit;
}

$wgSitename = '国豪野史';
$wgMetaNamespace = '国豪野史';
$wgLanguageCode = 'zh-hans';
$wgLocaltimezone = 'Asia/Shanghai';

$wgServer = getenv( 'MW_SERVER' ) ?: 'http://localhost:8080';
$wgScriptPath = '';
$wgArticlePath = '/wiki/$1';
$wgUsePathInfo = true;
$wgResourceBasePath = $wgScriptPath;

$wgDBtype = 'sqlite';
$wgDBname = 'ghc';
$wgDBserver = '';
$wgDBuser = '';
$wgDBpassword = '';
$wgSQLiteDataDir = '/var/www/data';

$secretFile = '/var/www/data/secrets.php';
if ( file_exists( $secretFile ) ) {
	require $secretFile;
}

$wgEnableEmail = false;
$wgEnableUserEmail = false;
$wgEnableUploads = true;
$wgUseImageMagick = true;
$wgImageMagickConvertCommand = '/usr/bin/convert';

$wgDefaultSkin = 'vector-2022';
wfLoadSkin( 'Vector' );

foreach ( [ 'Cite', 'ParserFunctions', 'WikiEditor' ] as $extension ) {
	if ( is_dir( "$IP/extensions/$extension" ) ) {
		wfLoadExtension( $extension );
	}
}

$wgGroupPermissions['*']['edit'] = false;
$wgGroupPermissions['*']['createaccount'] = false;
$wgGroupPermissions['user']['edit'] = true;
$wgGroupPermissions['user']['upload'] = true;
$wgGroupPermissions['user']['reupload'] = true;

$wgRightsText = 'CC BY-NC-SA 4.0';
$wgRightsUrl = 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans';
$wgRightsIcon = 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-sa.png';

$wgLogos = [
	'1x' => "$wgResourceBasePath/resources/ghc/logo.svg",
	'icon' => "$wgResourceBasePath/resources/ghc/favicon.svg",
	'wordmark' => [
		'src' => "$wgResourceBasePath/resources/ghc/logo.svg",
		'width' => 180,
		'height' => 50,
	],
];
$wgFavicon = "$wgResourceBasePath/resources/ghc/favicon.svg";
$wgEnableCanonicalServerLink = true;
$wgCookieSecure = str_starts_with( $wgServer, 'https://' );
$wgCookieSameSite = 'Lax';
$wgJobRunRate = 1;
$wgMainPageIsDomainRoot = true;
