/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

class ServerInfoProvider {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maTranslateProvider', 'maUserProvider', 'maUiLoginRedirectorProvider', 'maUiMenuProvider']; }
    
    constructor(maTranslateProvider, maUserProvider, maUiLoginRedirectorProvider, maUiMenuProvider) {
        this.maTranslateProvider = maTranslateProvider;
        this.maUserProvider = maUserProvider;
        this.maUiLoginRedirectorProvider = maUiLoginRedirectorProvider;
        this.maUiMenuProvider = maUiMenuProvider;
        
        const provider = this;
        
        this.factory = class ServerInfo {
            static get $$ngIsClass() { return true; }
            static get $inject() { return ['$q', '$http', 'maTranslate']; }
            
            constructor($q, $http, maTranslate) {
                this.$q = $q;
                this.$http = $http;
                this.maTranslate = maTranslate;
                
                if (provider.preLoginData) {
                    this.setPreLoginData(provider.preLoginData);
                }
                if (provider.postLoginData) {
                    this.setPostLoginData(provider.postLoginData);
                }
            }
            
            ensureData(reload = false) {
                return this.$q.all([
                    this.getPreLoginData(reload),
                    this.getPostLoginData(reload)
                ]).then(() => this);
            }

            getPreLoginData(reload = false) {
                if (!reload && this.preLoginData) {
                    return this.$q.resolve(this);
                }
                
                return this.$http({
                    method: 'GET',
                    url: '/rest/latest/ui-bootstrap/pre-login'
                }).then(response => {
                    this.setPreLoginData(response.data);
                    return this;
                });
            }

            getPostLoginData(reload = false) {
                if (!reload && this.postLoginData) {
                    return this.$q.resolve(this);
                }
                
                return this.$http({
                    method: 'GET',
                    url: '/rest/latest/ui-bootstrap/post-login'
                }).then(response => {
                    this.setPostLoginData(response.data);
                    return this;
                });
            }
            
            setPreLoginData(data) {
                this.preLoginData = data;
                
                this.lastUpgradeTime = data.lastUpgradeTime;
                this.serverLocale = data.serverLocale;
                this.serverTimezone = data.serverTimezone;
                this.publicRegistrationEnabled = data.publicRegistrationEnabled;

                // translations already loaded during config phase
                if (!data.config) {
                    this.maTranslate.loadTranslations(data.translations);
                }
            }
            
            setPostLoginData(data) {
                this.postLoginData = data;
                
                this.coreVersion = data.coreVersion;
                this.coreLicenseType = data.coreLicenseType;
                this.guid = data.guid;
                this.instanceDescription = data.instanceDescription;
                this.coreShortVersion = data.coreNormalVersion.split('.').slice(0, -1).join('.');

                // translations already loaded during config phase
                if (!data.config) {
                    this.maTranslate.loadTranslations(data.translations);
                }
            }
        };
    }
    
    setPreLoginData(data) {
        this.preLoginData = data;
        this.preLoginData.config = true;
        
        this.maTranslateProvider.loadTranslations(data.translations);
        this.maUserProvider.setSystemLocale(data.serverLocale);
        this.maUserProvider.setSystemTimezone(data.serverTimezone);
        this.maUiLoginRedirectorProvider.setLastUpgradeTime(data.lastUpgradeTime);
    }
    
    setPostLoginData(data) {
        this.postLoginData = data;
        this.postLoginData.config = true;
        
        this.maTranslateProvider.loadTranslations(data.translations);
        this.maUiMenuProvider.setCustomMenuStore(data.menu);
    }

    get $get() {
        return this.factory;
    }
}

export default ServerInfoProvider;
