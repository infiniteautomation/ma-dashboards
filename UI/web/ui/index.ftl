<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title ng-bind="titleText">Mango v3</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <base href="/ui/">

    <link rel="icon" type="image/png" sizes="192x192" href="/modules/mangoUI/web/img/icon192.png?v=${lastUpgrade?c}">
    <link rel="icon" type="image/png" sizes="128x128" href="/modules/mangoUI/web/img/icon128.png?v=${lastUpgrade?c}">
    <link rel="icon" type="image/png" sizes="96x96" href="/modules/mangoUI/web/img/icon96.png?v=${lastUpgrade?c}">
    <link rel="icon" type="image/png" sizes="32x32" href="/modules/mangoUI/web/img/icon32.png?v=${lastUpgrade?c}">
    <link rel="icon" type="image/png" sizes="16x16" href="/modules/mangoUI/web/img/icon16.png?v=${lastUpgrade?c}">
    <link rel="apple-touch-icon" type="image/png" sizes="128x128" href="/modules/mangoUI/web/img/icon128.png?v=${lastUpgrade?c}">
    <link rel="manifest" href="/modules/mangoUI/web/ui/manifest.json?v=${lastUpgrade?c}">
    
    <link rel="stylesheet" href="/modules/mangoUI/web/ui/styles/preBoot.css?v=${lastUpgrade?c}">

    <meta name="user-styles-after-here" content="">
</head>

<body layout="column" ng-class="{'api-down': !mangoWatchdog.apiUp, 'logged-out': !mangoWatchdog.loggedIn, 'ma-mobile': !$mdMedia('gt-sm'), 'ma-phone': $mdMedia('xs')}"
      md-theme="{{uiSettings.activeTheme}}" md-colors="{background: 'background'}">
    <div id="loading-bar-container" md-colors="{color: 'accent-hue-2'}"></div>
    
	<div ng-if="::appLoading" class="app-loading">
		<svg class="ma-ui-spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
		   <circle fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30" stroke="#FF8500"></circle>
		</svg>
		
        <div class="pre-bootstrap-error" style="display:none">
            <div></div>
            <a href="#">Show stack trace</a>
            <pre style="display:none"><code></code></pre>
        </div>
	</div>
    <div ng-cloak ng-if="::noApi" class="missing-module">mangoApi module is required.</div>
    <div ng-cloak ui-view ng-cloak layout="column" flex class="main-application" ng-class="stateNameClass"></div>

    <script src="/modules/mangoUI/web/dist/ui.js?v=${lastUpgrade?c}"></script>
</body>
</html>
