/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

VirtualSerialPortFactory.$inject = ['maRestResource'];
function VirtualSerialPortFactory(RestResource) {
    
    const baseUrl = '/rest/v2/virtual-serial-ports';
    const webSocketUrl = '/rest/v2/websocket/virtual-serial-ports';
    const xidPrefix = 'VSP_';

    const defaultProperties = {
        portName: '',
        address: 'localhost',
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