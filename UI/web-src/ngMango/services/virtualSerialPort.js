/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

VirtualSerialPortFactory.$inject = ['maRestResource'];
function VirtualSerialPortFactory(RestResource) {
    
    const baseUrl = '/rest/latest/virtual-serial-ports';
    const webSocketUrl = '/rest/latest/websocket/virtual-serial-ports';
    const xidPrefix = 'VSP_';

    const defaultProperties = {
        address: 'localhost',
        ipWhiteList: ['*.*.*.*'],
        portName: '',
        port: 9000,
        timeout: 0,
        portType: 'SERIAL_SOCKET_BRIDGE',
        bufferSize: 0
    };

    class VirtualSerialPortResource extends RestResource {
        static get defaultProperties() {
            return defaultProperties;
        }

        static get baseUrl() {
            return baseUrl;
        }

        static get webSocketUrl() {
            return webSocketUrl;
        }
        
        static get xidPrefix() {
            return xidPrefix;
        }

    }
    
    return VirtualSerialPortResource;
}

export default VirtualSerialPortFactory;