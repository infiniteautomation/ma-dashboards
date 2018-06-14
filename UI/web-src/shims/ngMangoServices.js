/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import ngMangoServices from '../ngMango/ngMangoServices';
// This is a workaround for a bug in webpack (Cannot read property 'call' of undefined - https://github.com/webpack/webpack/issues/959)
// The bug manifests itself only in production mode when an entry point has no unique code, i.e. another entry point also includes
// all the code inside this entry point
export default ngMangoServices;
