/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

const bootstrapUtil = Object.freeze({
    getCookie(name) {
        const cookies = document.cookie.split(/\s*;\s*/);
        for (let i = 0; i < cookies.length; i++) {
            const splitCookie = cookies[i].split('=');
            if (splitCookie[0] === name) {
                return splitCookie[1];
            }
        }
    },
    
    xhrRequest(options) {
        const xhr = new XMLHttpRequest();
        
        return new Promise(resolve => {
            xhr.addEventListener('load', resolve);
            xhr.addEventListener('error', resolve);
            xhr.addEventListener('abort', resolve);
            xhr.open(options.method, options.url);
            xhr.timeout = 30000;
            xhr.setRequestHeader('accept', 'application/json;charset=utf-8');
            
            if (options.method !== 'GET') {
                const xsrfToken = this.getCookie('XSRF-TOKEN');
                if (xsrfToken) {
                    xhr.setRequestHeader('X-XSRF-TOKEN', xsrfToken);
                }
            }
            
            if (options.data) {
                xhr.setRequestHeader('content-type', 'application/json;charset=utf-8');
                xhr.send(JSON.stringify(options.data));
            } else {
                xhr.send();
            }
        }).then(event => {
            const data = xhr.responseText && JSON.parse(event.target.responseText);
            return {
                status: xhr.status,
                statusText: xhr.statusText,
                getHeader: xhr.getResponseHeader.bind(xhr),
                data,
                xhr
            };
        });
    },
    
    getLocalStorage(name) {
        if (!window.localStorage) return;
        const value = window.localStorage.getItem(name);
        return value && JSON.parse(value);
    },
    
    setLocalStorage(name, value) {
        if (!window.localStorage) return;
        window.localStorage.setItem(name, JSON.stringify(value));
    },
    
    removeLocalStorage(name) {
        if (!window.localStorage) return;
        window.localStorage.removeItem(name);
    },
    
    login(credentials) {
        return this.xhrRequest({
            method: 'POST',
            url: '/rest/latest/login',
            data: credentials,
        }).then(response => {
            if (response.status === 200) {
                return response.data;
            }
            console.warn('Failed to login, credentials: ', credentials);
        });
    },
    
    autoLoginKey: 'ngMangoServices.storedCredentials',

    checkClearAutoLogin() {
        const searchParams = new URL(window.location.href).searchParams;
        if (searchParams) {
            if (searchParams.get('autoLoginDeleteCredentials') != null) {
                this.removeLocalStorage(this.autoLoginKey);
            }
        }
    },
    
    autoLogin(uiSettings) {
        const credentials = {
            username: uiSettings.autoLoginUsername,
            password: uiSettings.autoLoginPassword || ''
        };
        
        const localStorageCredentials = this.getLocalStorage(this.autoLoginKey);
        if (localStorageCredentials && localStorageCredentials.username) {
            credentials.username = localStorageCredentials.username;
            credentials.password = localStorageCredentials.password || '';
        }
        
        const searchParams = new URL(window.location.href).searchParams;
        if (searchParams) {
            const username = searchParams.get('autoLoginUsername');
            const password = searchParams.get('autoLoginPassword');
            
            if (username) {
                credentials.username = username;
                credentials.password = password || '';
                
                if (searchParams.get('autoLoginStoreCredentials') != null) {
                    this.setLocalStorage(this.autoLoginKey, credentials);
                }
            }
        }
        
        if (credentials && credentials.username) {
            return this.login(credentials);
        }
    }
});

export default bootstrapUtil;