
import { connect } from "cloudflare:sockets";

let password = '';
let proxyIP = '';
let DNS64Server = '';
//let sub = '';
let subConverter = atob('U1VCQVBJLkNNTGl1c3Nzcy5uZXQ=');
let subConfig = atob('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0FDTDRTU1IvQUNMNFNTUi9tYXN0ZXIvQ2xhc2gvY29uZmlnL0FDTDRTU1JfT25saW5lX01pbmlfTXVsdGlNb2RlLmluaQ==');
let subProtocol = 'https';
let subEmoji = 'true';
let socks5Address = '';
let parsedSocks5Address = {};
let enableSocks = false;
let enableHttp = false;
const expire = 4102329600;//2099-12-31
let proxyIPs;
let socks5s;
let go2Socks5s = [
    '*ttvnw.net',
    '*tapecontent.net',
    '*cloudatacdn.com',
    '*.loadshare.org',
];
let addresses = [];
let addressesapi = [];
let addressescsv = [];
let DLS = 8;
let remarkIndex = 1;//CSV备注所在列偏移量
let FileName = 'epeius';
let BotToken = '';
let ChatID = '';
let proxyhosts = [];
let proxyhostsURL = '';
let RproxyIP = 'false';
let httpsPorts = ["2053", "2083", "2087", "2096", "8443"];
let sha224Password;
const regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[.*\]):?(\d+)?#?(.*)?$/;
let proxyIPPool = [];
let path = '/?ed=2560';
let link = [];
let banHosts = [atob('c3BlZWQuY2xvdWRmbGFyZS5jb20=')];
let SCV = 'true';
let allowInsecure = '&allowInsecure=1';
export default {
    async fetch(request, env, ctx) {
        try {
            const UA = request.headers.get('User-Agent') || 'null';
            const userAgent = UA.toLowerCase();
            password = env.PASSWORD || env.pswd || env.UUID || env.uuid || env.TOKEN || password;
            if (!password) {
                return new Response('请设置你的PASSWORD变量，或尝试重试部署，检查变量是否生效？', {
                    status: 404,
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8",
                    }
                });
            }
            sha224Password = env.SHA224 || env.SHA224PASS || sha224(password);
            //console.log(sha224Password);

            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0); // 设置时间为当天
            const timestamp = Math.ceil(currentDate.getTime() / 1000);
            const fakeUserIDMD5 = await MD5MD5(`${password}${timestamp}`);
            const fakeUserID = [
                fakeUserIDMD5.slice(0, 8),
                fakeUserIDMD5.slice(8, 12),
                fakeUserIDMD5.slice(12, 16),
                fakeUserIDMD5.slice(16, 20),
                fakeUserIDMD5.slice(20)
            ].join('-');

            const fakeHostName = `${fakeUserIDMD5.slice(6, 9)}.${fakeUserIDMD5.slice(13, 19)}`;

            proxyIP = env.PROXYIP || env.proxyip || proxyIP;
            proxyIPs = await ADD(proxyIP);
            proxyIP = proxyIPs[Math.floor(Math.random() * proxyIPs.length)];
            DNS64Server = env.DNS64 || env.NAT64 || (DNS64Server != '' ? DNS64Server : atob("ZG5zNjQuY21saXVzc3NzLm5ldA=="));
            socks5Address = env.HTTP || env.SOCKS5 || socks5Address;
            socks5s = await ADD(socks5Address);
            socks5Address = socks5s[Math.floor(Math.random() * socks5s.length)];
            enableHttp = env.HTTP ? true : socks5Address.toLowerCase().includes('http://');
            socks5Address = socks5Address.split('//')[1] || socks5Address;
            if (env.GO2SOCKS5) go2Socks5s = await ADD(env.GO2SOCKS5);
            if (env.CFPORTS) httpsPorts = await ADD(env.CFPORTS);
            if (env.BAN) banHosts = await ADD(env.BAN);
            if (socks5Address) {
                try {
                    parsedSocks5Address = socks5AddressParser(socks5Address);
                    RproxyIP = env.RPROXYIP || 'false';
                    enableSocks = true;
                } catch (err) {
                    /** @type {Error} */
                    let e = err;
                    console.log(e.toString());
                    RproxyIP = env.RPROXYIP || !proxyIP ? 'true' : 'false';
                    enableSocks = false;
                }
            } else {
                RproxyIP = env.RPROXYIP || !proxyIP ? 'true' : 'false';
            }

            const upgradeHeader = request.headers.get("Upgrade");
            const url = new URL(request.url);
            if (!upgradeHeader || upgradeHeader !== "websocket") {
                if (env.ADD) addresses = await ADD(env.ADD);
                if (env.ADDAPI) addressesapi = await ADD(env.ADDAPI);
                if (env.ADDCSV) addressescsv = await ADD(env.ADDCSV);
                DLS = Number(env.DLS) || DLS;
                remarkIndex = Number(env.CSVREMARK) || remarkIndex;
                BotToken = env.TGTOKEN || BotToken;
                ChatID = env.TGID || ChatID;
                FileName = env.SUBNAME || FileName;
                subEmoji = env.SUBEMOJI || env.EMOJI || subEmoji;
                if (subEmoji == '0') subEmoji = 'false';
                if (env.LINK) link = await ADD(env.LINK);
                let sub = env.SUB || '';
                subConverter = env.SUBAPI || subConverter;
                if (subConverter.includes("http://")) {
                    subConverter = subConverter.split("//")[1];
                    subProtocol = 'http';
                } else {
                    subConverter = subConverter.split("//")[1] || subConverter;
                }
                subConfig = env.SUBCONFIG || subConfig;
                if (url.searchParams.has('sub') && url.searchParams.get('sub') !== '') sub = url.searchParams.get('sub').toLowerCase();

                if (url.searchParams.has('proxyip')) {
                    path = `/proxyip=${url.searchParams.get('proxyip')}`;
                    RproxyIP = 'false';
                } else if (url.searchParams.has('socks5')) {
                    path = `/?socks5=${url.searchParams.get('socks5')}`;
                    RproxyIP = 'false';
                } else if (url.searchParams.has('socks')) {
                    path = `/?socks5=${url.searchParams.get('socks')}`;
                    RproxyIP = 'false';
                }
                SCV = env.SCV || SCV;
                if (!SCV || SCV == '0' || SCV == 'false') allowInsecure = '';
                else SCV = 'true';
                switch (url.pathname) {
                    case '/':
                        if (env.URL302) return Response.redirect(env.URL302, 302);
                        else if (env.URL) return await proxyURL(env.URL, url);
                        else return new Response(JSON.stringify(request.cf, null, 4), {
                            status: 200,
                            headers: {
                                'content-type': 'application/json',
                            },
                        });
                    case `/${fakeUserID}`:
                        const fakeConfig = await get特洛伊Config(password, request.headers.get('Host'), sub, 'CF-Workers-SUB', RproxyIP, url, fakeUserID, fakeHostName, env);
                        return new Response(`${fakeConfig}`, { status: 200 });
                    case `/${password}/edit`:
                        return await KV(request, env);
                    case `/${password}/bestip`:
                        return await bestIP(request, env);
                    case `/${password}`:
                        await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${UA}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
                        const 特洛伊Config = await get特洛伊Config(password, request.headers.get('Host'), sub, UA, RproxyIP, url, fakeUserID, fakeHostName, env);
                        const now = Date.now();
                        //const timestamp = Math.floor(now / 1000);
                        const today = new Date(now);
                        today.setHours(0, 0, 0, 0);
                        const UD = Math.floor(((now - today.getTime()) / 86400000) * 24 * 1099511627776 / 2);
                        let pagesSum = UD;
                        let workersSum = UD;
                        let total = 24 * 1099511627776;

                        if (userAgent && (userAgent.includes('mozilla') || userAgent.includes('subconverter'))) {
                            return new Response(特洛伊Config, {
                                status: 200,
                                headers: {
                                    "Content-Type": "text/html;charset=utf-8",
                                    "Profile-Update-Interval": "6",
                                    "Subscription-Userinfo": `upload=${pagesSum}; download=${workersSum}; total=${total}; expire=${expire}`,
                                    "Cache-Control": "no-store",
                                }
                            });
                        } else {
                            return new Response(特洛伊Config, {
                                status: 200,
                                headers: {
                                    "Content-Disposition": `attachment; filename=${FileName}; filename*=utf-8''${encodeURIComponent(FileName)}`,
                                    //"Content-Type": "text/plain;charset=utf-8",
                                    "Profile-Update-Interval": "6",
                                    "Profile-web-page-url": request.url.includes('?') ? request.url.split('?')[0] : request.url,
                                    "Subscription-Userinfo": `upload=${pagesSum}; download=${workersSum}; total=${total}; expire=${expire}`,
                                }
                            });
                        }
                    default:
                        if (env.URL302) return Response.redirect(env.URL302, 302);
                        else if (env.URL) return await proxyURL(env.URL, url);
                        else return new Response('不用怀疑！你PASSWORD就是错的！！！', { status: 404 });
                }
            } else {
                socks5Address = url.searchParams.get('socks5') || socks5Address;
                if (new RegExp('/socks5=', 'i').test(url.pathname)) socks5Address = url.pathname.split('5=')[1];
                else if (new RegExp('/socks://', 'i').test(url.pathname) || new RegExp('/socks5://', 'i').test(url.pathname) || new RegExp('/http://', 'i').test(url.pathname)) {
                    enableHttp = url.pathname.includes('http://');
                    socks5Address = url.pathname.split('://')[1].split('#')[0];
                    if (socks5Address.includes('@')) {
                        let userPassword = socks5Address.split('@')[0].replaceAll('%3D', '=');
                        const base64Regex = /^(?:[A-Z0-9+/]{4})*(?:[A-Z0-9+/]{2}==|[A-Z0-9+/]{3}=)?$/i;
                        if (base64Regex.test(userPassword) && !userPassword.includes(':')) userPassword = atob(userPassword);
                        socks5Address = `${userPassword}@${socks5Address.split('@')[1]}`;
                    }
                    go2Socks5s = ['all in'];
                }

                if (socks5Address) {
                    try {
                        parsedSocks5Address = socks5AddressParser(socks5Address);
                        enableSocks = true;
                    } catch (err) {
                        /** @type {Error} */
                        let e = err;
                        console.log(e.toString());
                        enableSocks = false;
                    }
                } else {
                    enableSocks = false;
                }

                if (url.searchParams.has('proxyip')) {
                    proxyIP = url.searchParams.get('proxyip');
                    enableSocks = false;
                } else if (new RegExp('/proxyip=', 'i').test(url.pathname)) {
                    proxyIP = url.pathname.toLowerCase().split('/proxyip=')[1];
                    enableSocks = false;
                } else if (new RegExp('/proxyip.', 'i').test(url.pathname)) {
                    proxyIP = `proxyip.${url.pathname.toLowerCase().split("/proxyip.")[1]}`;
                    enableSocks = false;
                } else if (new RegExp('/pyip=', 'i').test(url.pathname)) {
                    proxyIP = url.pathname.toLowerCase().split('/pyip=')[1];
                    enableSocks = false;
                }

                return await 特洛伊OverWSHandler(request);
            }
        } catch (err) {
            let e = err;
            return new Response(e.toString());
        }
    }
};

async function 特洛伊OverWSHandler(request) {
    const webSocketPair = new WebSocketPair();
    const [client, webSocket] = Object.values(webSocketPair);
    webSocket.accept();
    let address = "";
    let portWithRandomLog = "";
    const log = (info, event) => {
        console.log(`[${address}:${portWithRandomLog}] ${info}`, event || "");
    };
    const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";
    const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);
    let remoteSocketWapper = {
        value: null
    };
    let udpStreamWrite = null;
    readableWebSocketStream.pipeTo(new WritableStream({
        async write(chunk, controller) {
            if (udpStreamWrite) {
                return udpStreamWrite(chunk);
            }
            if (remoteSocketWapper.value) {
                const writer = remoteSocketWapper.value.writable.getWriter();
                await writer.write(chunk);
                writer.releaseLock();
                return;
            }
            const {
                hasError,
                message,
                portRemote = 443,
                addressRemote = "",
                rawClientData,
                addressType
            } = await parse特洛伊Header(chunk);
            address = addressRemote;
            portWithRandomLog = `${portRemote}--${Math.random()} tcp`;
            if (hasError) {
                throw new Error(message);
                return;
            }
            if (!banHosts.includes(addressRemote)) {
                log(`处理 TCP 出站连接 ${addressRemote}:${portRemote}`);
                handleTCPOutBound(remoteSocketWapper, addressRemote, portRemote, rawClientData, webSocket, log, addressType);
            } else {
                throw new Error(`黑名单关闭 TCP 出站连接 ${addressRemote}:${portRemote}`);
            }
        },
        close() {
            log(`readableWebSocketStream is closed`);
        },
        abort(reason) {
            log(`readableWebSocketStream is aborted`, JSON.stringify(reason));
        }
    })).catch((err) => {
        log("readableWebSocketStream pipeTo error", err);
    });
    return new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: client
    });
}

async function parse特洛伊Header(buffer) {
    if (buffer.byteLength < 56) {
        return {
            hasError: true,
            message: "invalid data"
        };
    }
    let crLfIndex = 56;
    if (new Uint8Array(buffer.slice(56, 57))[0] !== 0x0d || new Uint8Array(buffer.slice(57, 58))[0] !== 0x0a) {
        return {
            hasError: true,
            message: "invalid header format (missing CR LF)"
        };
    }
    const password = new TextDecoder().decode(buffer.slice(0, crLfIndex));
    if (password !== sha224Password) {
        return {
            hasError: true,
            message: "invalid password"
        };
    }

    const socks5DataBuffer = buffer.slice(crLfIndex + 2);
    if (socks5DataBuffer.byteLength < 6) {
        return {
            hasError: true,
            message: "invalid SOCKS5 request data"
        };
    }

    const view = new DataView(socks5DataBuffer);
    const cmd = view.getUint8(0);
    if (cmd !== 1) {
        return {
            hasError: true,
            message: "unsupported command, only TCP (CONNECT) is allowed"
        };
    }

    const atype = view.getUint8(1);
    // 0x01: IPv4 address
    // 0x03: Domain name
    // 0x04: IPv6 address
    let addressLength = 0;
    let addressIndex = 2;
    let address = "";
    switch (atype) {
        case 1:
            addressLength = 4;
            address = new Uint8Array(
                socks5DataBuffer.slice(addressIndex, addressIndex + addressLength)
            ).join(".");
            break;
        case 3:
            addressLength = new Uint8Array(
                socks5DataBuffer.slice(addressIndex, addressIndex + 1)
            )[0];
            addressIndex += 1;
            address = new TextDecoder().decode(
                socks5DataBuffer.slice(addressIndex, addressIndex + addressLength)
            );
            break;
        case 4:
            addressLength = 16;
            const dataView = new DataView(socks5DataBuffer.slice(addressIndex, addressIndex + addressLength));
            const ipv6 = [];
            for (let i = 0; i < 8; i++) {
                ipv6.push(dataView.getUint16(i * 2).toString(16));
            }
            address = ipv6.join(":");
            break;
        default:
            return {
                hasError: true,
                message: `invalid addressType is ${atype}`
            };
    }

    if (!address) {
        return {
            hasError: true,
            message: `address is empty, addressType is ${atype}`
        };
    }

    const portIndex = addressIndex + addressLength;
    const portBuffer = socks5DataBuffer.slice(portIndex, portIndex + 2);
    const portRemote = new DataView(portBuffer).getUint16(0);
    return {
        hasError: false,
        addressRemote: address,
        portRemote,
        rawClientData: socks5DataBuffer.slice(portIndex + 4),
        addressType: atype
    };
}

async function handleTCPOutBound(remoteSocket, addressRemote, portRemote, rawClientData, webSocket, log, addressType) {
    async function useSocks5Pattern(address) {
        if (go2Socks5s.includes(atob('YWxsIGlu')) || go2Socks5s.includes(atob('Kg=='))) return true;
        return go2Socks5s.some(pattern => {
            let regexPattern = pattern.replace(/\*/g, '.*');
            let regex = new RegExp(`^${regexPattern}$`, 'i');
            return regex.test(address);
        });
    }
    async function connectAndWrite(address, port, socks = false, http = false) {
        log(`connected to ${address}:${port}`);
        //if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(address)) address = `${atob('d3d3Lg==')}${address}${atob('LmlwLjA5MDIyNy54eXo=')}`;
        // 先确定连接方式，再创建连接
        const tcpSocket = socks
            ? (http ? await httpConnect(address, port, log) : await socks5Connect(addressType, address, port, log))
            : connect({ hostname: address, port: port });
        remoteSocket.value = tcpSocket;
        //log(`connected to ${address}:${port}`);
        const writer = tcpSocket.writable.getWriter();
        await writer.write(rawClientData);
        writer.releaseLock();
        return tcpSocket;
    }
    async function nat64() {
        if (!useSocks) {
            const nat64Proxyip = `[${await resolveToIPv6(addressRemote)}]`;
            log(`NAT64 代理连接到 ${nat64Proxyip}:443`);
            tcpSocket = await connectAndWrite(nat64Proxyip, '443');
        }
        tcpSocket.closed.catch(error => {
            console.log('retry tcpSocket closed error', error);
        }).finally(() => {
            safeCloseWebSocket(webSocket);
        })
        remoteSocketToWS(tcpSocket, webSocket, null, log);
    }
    async function retry() {
        if (enableSocks) {
            tcpSocket = await connectAndWrite(addressRemote, portRemote, true, enableHttp);
        } else {
            if (!proxyIP || proxyIP == '') {
                proxyIP = atob('UFJPWFlJUC50cDEuMDkwMjI3Lnh5eg==');
            } else if (proxyIP.includes(']:')) {
                portRemote = proxyIP.split(']:')[1] || portRemote;
                proxyIP = proxyIP.split(']:')[0] + "]" || proxyIP;
            } else if (proxyIP.split(':').length === 2) {
                portRemote = proxyIP.split(':')[1] || portRemote;
                proxyIP = proxyIP.split(':')[0] || proxyIP;
            }
            if (proxyIP.includes('.tp')) portRemote = proxyIP.split('.tp')[1].split('.')[0] || portRemote;
            tcpSocket = await connectAndWrite(proxyIP.toLowerCase() || addressRemote, portRemote);
        }
        /*
        tcpSocket.closed.catch((error) => {
            console.log("retry tcpSocket closed error", error);
        }).finally(() => {
            safeCloseWebSocket(webSocket);
        });
        */
        remoteSocketToWS(tcpSocket, webSocket, nat64, log);
    }
    let useSocks = false;
    if (go2Socks5s.length > 0 && enableSocks) useSocks = await useSocks5Pattern(addressRemote);
    let tcpSocket = await connectAndWrite(addressRemote, portRemote, useSocks, enableHttp);
    remoteSocketToWS(tcpSocket, webSocket, retry, log);
}

function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
    let readableStreamCancel = false;
    const stream = new ReadableStream({
        start(controller) {
            webSocketServer.addEventListener("message", (event) => {
                if (readableStreamCancel) {
                    return;
                }
                const message = event.data;
                controller.enqueue(message);
            });
            webSocketServer.addEventListener("close", () => {
                safeCloseWebSocket(webSocketServer);
                if (readableStreamCancel) {
                    return;
                }
                controller.close();
            });
            webSocketServer.addEventListener("error", (err) => {
                log("webSocketServer error");
                controller.error(err);
            });
            const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
            if (error) {
                controller.error(error);
            } else if (earlyData) {
                controller.enqueue(earlyData);
            }
        },
        pull(controller) { },
        cancel(reason) {
            if (readableStreamCancel) {
                return;
            }
            log(`readableStream was canceled, due to ${reason}`);
            readableStreamCancel = true;
            safeCloseWebSocket(webSocketServer);
        }
    });
    return stream;
}

async function remoteSocketToWS(remoteSocket, webSocket, retry, log) {
    let hasIncomingData = false;
    await remoteSocket.readable.pipeTo(
        new WritableStream({
            start() { },
            /**
             *
             * @param {Uint8Array} chunk
             * @param {*} controller
             */
            async write(chunk, controller) {
                hasIncomingData = true;
                if (webSocket.readyState !== WS_READY_STATE_OPEN) {
                    controller.error(
                        "webSocket connection is not open"
                    );
                }
                webSocket.send(chunk);
            },
            close() {
                log(`remoteSocket.readable is closed, hasIncomingData: ${hasIncomingData}`);
            },
            abort(reason) {
                console.error("remoteSocket.readable abort", reason);
            }
        })
    ).catch((error) => {
        console.error(
            `remoteSocketToWS error:`,
            error.stack || error
        );
        safeCloseWebSocket(webSocket);
    });
    if (hasIncomingData === false && retry) {
        log(`retry`);
        retry();
    }
}
/*
function isValidSHA224(hash) {
    const sha224Regex = /^[0-9a-f]{56}$/i;
    return sha224Regex.test(hash);
}
*/
function base64ToArrayBuffer(base64Str) {
    if (!base64Str) {
        return { earlyData: undefined, error: null };
    }
    try {
        base64Str = base64Str.replace(/-/g, "+").replace(/_/g, "/");
        const decode = atob(base64Str);
        const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
        return { earlyData: arryBuffer.buffer, error: null };
    } catch (error) {
        return { earlyData: undefined, error };
    }
}

let WS_READY_STATE_OPEN = 1;
let WS_READY_STATE_CLOSING = 2;

function safeCloseWebSocket(socket) {
    try {
        if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
            socket.close();
        }
    } catch (error) {
        console.error("safeCloseWebSocket error", error);
    }
}

/*
export {
    worker_default as
    default
};
//# sourceMappingURL=worker.js.map
*/

function revertFakeInfo(content, userID, hostName, fakeUserID, fakeHostName, isBase64) {
    if (isBase64) content = atob(content);//Base64解码
    content = content.replace(new RegExp(fakeUserID, 'g'), userID).replace(new RegExp(fakeHostName, 'g'), hostName);
    //console.log(content);
    if (isBase64) content = btoa(content);//Base64编码

    return content;
}

async function MD5MD5(text) {
    const encoder = new TextEncoder();

    const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
    const firstPassArray = Array.from(new Uint8Array(firstPass));
    const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
    const secondPassArray = Array.from(new Uint8Array(secondPass));
    const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return secondHex.toLowerCase();
}

async function ADD(内容) {
    // 将制表符、双引号、单引号和换行符都替换为逗号
    // 然后将连续的多个逗号替换为单个逗号
    var 替换后的内容 = 内容.replace(/[	|"'\r\n]+/g, ',').replace(/,+/g, ',');

    // 删除开头和结尾的逗号（如果有的话）
    if (替换后的内容.charAt(0) == ',') 替换后的内容 = 替换后的内容.slice(1);
    if (替换后的内容.charAt(替换后的内容.length - 1) == ',') 替换后的内容 = 替换后的内容.slice(0, 替换后的内容.length - 1);

    // 使用逗号分割字符串，得到地址数组
    const 地址数组 = 替换后的内容.split(',');

    return 地址数组;
}

async function proxyURL(proxyURL, url) {
    const URLs = await ADD(proxyURL);
    const fullURL = URLs[Math.floor(Math.random() * URLs.length)];
    // 解析目标 URL
    let parsedURL = new URL(fullURL);
    console.log(parsedURL);
    // 提取并可能修改 URL 组件
    let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
    let URLHostname = parsedURL.hostname;
    let URLPathname = parsedURL.pathname;
    let URLSearch = parsedURL.search;
    // 处理 pathname
    if (URLPathname.charAt(URLPathname.length - 1) == '/') {
        URLPathname = URLPathname.slice(0, -1);
    }
    URLPathname += url.pathname;
    // 构建新的 URL
    let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;
    // 反向代理请求
    let response = await fetch(newURL);
    // 创建新的响应
    let newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    });
    // 添加自定义头部，包含 URL 信息
    //newResponse.headers.set('X-Proxied-By', 'Cloudflare Worker');
    //newResponse.headers.set('X-Original-URL', fullURL);
    newResponse.headers.set('X-New-URL', newURL);
    return newResponse;
}

function 配置信息(密码, 域名地址) {
    const 啥啥啥_写的这是啥啊 = 'dHJvamFu';
    const 协议类型 = atob(啥啥啥_写的这是啥啊);

    const 别名 = FileName;
    let 地址 = 域名地址;
    let 端口 = 443;

    const 传输层协议 = 'ws';
    const 伪装域名 = 域名地址;
    const 路径 = path;

    let 传输层安全 = ['tls', true];
    const SNI = 域名地址;
    const 指纹 = 'randomized';

    const v2ray = `${协议类型}://${encodeURIComponent(密码)}@${地址}:${端口}?security=${传输层安全[0]}&sni=${SNI}&alpn=h3&fp=${指纹}&type=${传输层协议}&host=${伪装域名}&path=${encodeURIComponent(路径) + allowInsecure}&fragment=1,40-60,30-50,tlshello#${encodeURIComponent(别名)}`
    const clash = `- {name: ${别名}, server: ${地址}, port: ${端口}, udp: false, client-fingerprint: ${指纹}, type: ${协议类型}, password: ${密码}, sni: ${SNI}, alpn: [h3], skip-cert-verify: ${SCV}, network: ${传输层协议}, ws-opts: {path: "${路径}", headers: {Host: ${伪装域名}}}}`;

    return [v2ray, clash];
}

let subParams = ['sub', 'base64', 'b64', 'clash', 'singbox', 'sb', 'surge'];
const cmad = decodeURIComponent(atob(`dGVsZWdyYW0lMjAlRTQlQkElQTQlRTYlQjUlODElRTclQkUlQTQlMjAlRTYlOEElODAlRTYlOUMlQUYlRTUlQTQlQTclRTQlQkQlQUMlN0UlRTUlOUMlQTglRTclQkElQkYlRTUlOEYlOTElRTclODklOEMhJTNDYnIlM0UKJTNDYSUyMGhyZWYlM0QlMjdodHRwcyUzQSUyRiUyRnQubWUlMkZDTUxpdXNzc3MlMjclM0VodHRwcyUzQSUyRiUyRnQubWUlMkZDTUxpdXNzc3MlM0MlMkZhJTNFJTNDYnIlM0UKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJTNDYnIlM0UKZ2l0aHViJTIwJUU5JUExJUI5JUU3JTlCJUFFJUU1JTlDJUIwJUU1JTlEJTgwJTIwU3RhciFTdGFyIVN0YXIhISElM0NiciUzRQolM0NhJTIwaHJlZiUzRCUyN2h0dHBzJTNBJTJGJTJGZ2l0aHViLmNvbSUyRmNtbGl1JTJGZXBlaXVzJTI3JTNFaHR0cHMlM0ElMkYlMkZnaXRodWIuY29tJTJGY21saXUlMkZlcGVpdXMlM0MlMkZhJTNFJTNDYnIlM0UKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJTNDYnIlM0UKJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIzJTIz`));
async function get特洛伊Config(password, hostName, sub, UA, RproxyIP, _url, fakeUserID, fakeHostName, env) {
    if (sub) {
        const match = sub.match(/^(?:https?:\/\/)?([^\/]+)/);
        if (match) {
            sub = match[1];
        }
        const subs = await ADD(sub);
        if (subs.length > 1) sub = subs[0];
    } else {
        if (env.KV) {
            await 迁移地址列表(env);
            const 优选地址列表 = await env.KV.get('ADD.txt');
            if (优选地址列表) {
                const 优选地址数组 = await ADD(优选地址列表);
                const 分类地址 = {
                    接口地址: new Set(),
                    链接地址: new Set(),
                    优选地址: new Set()
                };

                for (const 元素 of 优选地址数组) {
                    if (元素.startsWith('https://')) {
                        分类地址.接口地址.add(元素);
                    } else if (元素.includes('://')) {
                        分类地址.链接地址.add(元素);
                    } else {
                        分类地址.优选地址.add(元素);
                    }
                }

                addressesapi = [...分类地址.接口地址];
                link = [...分类地址.链接地址];
                addresses = [...分类地址.优选地址];
            }
        }

        if ((addresses.length + addressesapi.length + addressescsv.length) == 0) {
            // 定义 Cloudflare IP 范围的 CIDR 列表
            let cfips = [
                '103.21.244.0/24',
                '104.16.0.0/13',
                '104.24.0.0/14',
                '172.64.0.0/14',
                '104.16.0.0/14',
                '104.24.0.0/15',
                '141.101.64.0/19',
                '172.64.0.0/14',
                '188.114.96.0/21',
                '190.93.240.0/21',
                '162.159.152.0/23',
                '104.16.0.0/13',
                '104.24.0.0/14',
                '172.64.0.0/14',
                '104.16.0.0/14',
                '104.24.0.0/15',
                '141.101.64.0/19',
                '172.64.0.0/14',
                '188.114.96.0/21',
                '190.93.240.0/21',
            ];

            // 生成符合给定 CIDR 范围的随机 IP 地址
            function generateRandomIPFromCIDR(cidr) {
                const [base, mask] = cidr.split('/');
                const baseIP = base.split('.').map(Number);
                const subnetMask = 32 - parseInt(mask, 10);
                const maxHosts = Math.pow(2, subnetMask) - 1;
                const randomHost = Math.floor(Math.random() * maxHosts);

                const randomIP = baseIP.map((octet, index) => {
                    if (index < 2) return octet;
                    if (index === 2) return (octet & (255 << (subnetMask - 8))) + ((randomHost >> 8) & 255);
                    return (octet & (255 << subnetMask)) + (randomHost & 255);
                });

                return randomIP.join('.');
            }
            addresses = addresses.concat('127.0.0.1:1234#CFnat');
            let counter = 1;
            const randomPorts = httpsPorts.concat('443');
            addresses = addresses.concat(
                cfips.map(cidr => generateRandomIPFromCIDR(cidr) + ':' + randomPorts[Math.floor(Math.random() * randomPorts.length)] + '#CF随机节点' + String(counter++).padStart(2, '0'))
            );
        }
    }

    const userAgent = UA.toLowerCase();
    const Config = 配置信息(password, hostName);
    const v2ray = Config[0];
    const clash = Config[1];
    let proxyhost = "";
    if (hostName.includes(".workers.dev")) {
        if (proxyhostsURL && (!proxyhosts || proxyhosts.length == 0)) {
            try {
                const response = await fetch(proxyhostsURL);

                if (!response.ok) {
                    console.error('获取地址时出错:', response.status, response.statusText);
                    return; // 如果有错误，直接返回
                }

                const text = await response.text();
                const lines = text.split('\n');
                // 过滤掉空行或只包含空白字符的行
                const nonEmptyLines = lines.filter(line => line.trim() !== '');

                proxyhosts = proxyhosts.concat(nonEmptyLines);
            } catch (error) {
                //console.error('获取地址时出错:', error);
            }
        }
        if (proxyhosts.length != 0) proxyhost = proxyhosts[Math.floor(Math.random() * proxyhosts.length)] + "/";
    }

    if (userAgent.includes('mozilla') && !subParams.some(_searchParams => _url.searchParams.has(_searchParams))) {
        let surge = `Surge订阅地址:<br><a href="javascript:void(0)" onclick="copyToClipboard('https://${proxyhost}${hostName}/${password}?surge','qrcode_4')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${proxyhost}${hostName}/${password}?surge</a><br><div id="qrcode_4" style="margin: 10px 10px 10px 10px;"></div>`;
        if (hostName.includes(".workers.dev")) surge = "Surge订阅必须绑定自定义域";
        const newSocks5s = socks5s.map(socks5Address => {
            if (socks5Address.includes('@')) return socks5Address.split('@')[1];
            else if (socks5Address.includes('//')) return socks5Address.split('//')[1];
            else return socks5Address;
        });

        let socks5List = '';
        if (go2Socks5s.length > 0 && enableSocks) {
            socks5List = `${(enableHttp ? "HTTP" : "Socks5") + decodeURIComponent('%EF%BC%88%E7%99%BD%E5%90%8D%E5%8D%95%EF%BC%89%3A%20')}`;
            if (go2Socks5s.includes(atob('YWxsIGlu')) || go2Socks5s.includes(atob('Kg=='))) socks5List += `${decodeURIComponent('%E6%89%80%E6%9C%89%E6%B5%81%E9%87%8F')}<br>`;
            else socks5List += `<br>&nbsp;&nbsp;${go2Socks5s.join('<br>&nbsp;&nbsp;')}<br>`;
        }

        let 订阅器 = '';
        if (sub) {
            if (enableSocks) 订阅器 += `CFCDN（访问方式）: ${enableHttp ? "HTTP" : "Socks5"}<br>&nbsp;&nbsp;${newSocks5s.join('<br>&nbsp;&nbsp;')}<br>${socks5List}`;
            else if (proxyIP && proxyIP != '') 订阅器 += `CFCDN（访问方式）: ProxyIP<br>&nbsp;&nbsp;${proxyIPs.join('<br>&nbsp;&nbsp;')}<br>`;
            else if (RproxyIP == 'true') 订阅器 += `CFCDN（访问方式）: 自动获取ProxyIP<br>`;
            else 订阅器 += `CFCDN（访问方式）: 无法访问, 需要您设置 proxyIP/PROXYIP ！！！<br>`
            订阅器 += `<br>SUB（优选订阅生成器）: ${sub}`;
        } else {
            if (enableSocks) 订阅器 += `CFCDN（访问方式）: ${enableHttp ? "HTTP" : "Socks5"}<br>&nbsp;&nbsp;${newSocks5s.join('<br>&nbsp;&nbsp;')}<br>${socks5List}`;
            else if (proxyIP && proxyIP != '') 订阅器 += `CFCDN（访问方式）: ProxyIP<br>&nbsp;&nbsp;${proxyIPs.join('<br>&nbsp;&nbsp;')}<br>`;
            else 订阅器 += `CFCDN（访问方式）: 无法访问, 需要您设置 proxyIP/PROXYIP ！！！<br>`;
            let 判断是否绑定KV空间 = '';
            if (env.KV) 判断是否绑定KV空间 = ` [<a href='${_url.pathname}/edit'>编辑优选列表</a>]  [<a href='${_url.pathname}/bestip'>在线优选IP</a>]`;
            订阅器 += `<br>您的订阅内容由 内置 addresses/ADD* 参数变量提供${判断是否绑定KV空间}<br>`;
            if (addresses.length > 0) 订阅器 += `ADD（TLS优选域名&IP）: <br>&nbsp;&nbsp;${addresses.join('<br>&nbsp;&nbsp;')}<br>`;
            if (addressesapi.length > 0) 订阅器 += `ADDAPI（TLS优选域名&IP 的 API）: <br>&nbsp;&nbsp;${addressesapi.join('<br>&nbsp;&nbsp;')}<br>`;
            if (addressescsv.length > 0) 订阅器 += `ADDCSV（IPTest测速csv文件 限速 ${DLS} ）: <br>&nbsp;&nbsp;${addressescsv.join('<br>&nbsp;&nbsp;')}<br>`;
        }

        const 节点配置页 = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${FileName} - 代理订阅服务</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="a" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23ff69b4" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ff69b4" stop-opacity="0"/></radialGradient></defs><circle cx="20" cy="20" r="10" fill="url(%23a)"/><circle cx="80" cy="40" r="15" fill="url(%23a)"/><circle cx="40" cy="80" r="12" fill="url(%23a)"/></svg>') repeat;
            animation: float 20s ease-in-out infinite;
            pointer-events: none;
            z-index: -1;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .logo img {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }

        .title {
            color: white;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .subtitle {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.1rem;
            font-weight: 300;
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            padding: 30px;
            margin-bottom: 30px;
            transition: all 0.3s ease;
        }

        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        }

        .card-title {
            color: white;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .card-title::before {
            content: '🔗';
            font-size: 1.2rem;
        }

        .subscription-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .sub-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }

        .sub-item:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.02);
        }

        .sub-label {
            color: #ff69b4;
            font-weight: 600;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .sub-link {
            color: white;
            text-decoration: none;
            word-break: break-all;
            font-size: 0.9rem;
            line-height: 1.4;
            cursor: pointer;
            transition: color 0.3s ease;
        }

        .sub-link:hover {
            color: #ff69b4;
        }

        .qr-container {
            margin-top: 15px;
            text-align: center;
            min-height: 50px;
        }

        .btn {
            background: linear-gradient(135deg, #ff69b4, #ff1493);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 105, 180, 0.3);
        }

        .toggle-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 10px 20px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
        }

        .toggle-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .notice-content {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 20px;
            margin-top: 15px;
            border-left: 4px solid #ff69b4;
        }

        .notice-content p {
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.6;
            margin-bottom: 15px;
        }

        .config-info {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 15px;
            padding: 20px;
            font-family: 'Courier New', monospace;
        }

        .config-item {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 8px;
            font-size: 0.9rem;
        }

        .config-label {
            color: #ff69b4;
            font-weight: 600;
        }

        .footer {
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 40px;
            padding: 20px;
        }

        @media (max-width: 768px) {
            .title {
                font-size: 2rem;
            }

            .subscription-grid {
                grid-template-columns: 1fr;
            }

            .glass-card {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <img src="粉色恐龙-1-removebg.png" alt="Logo" onerror="this.style.display='none'">
            </div>
            <h1 class="title">${FileName}</h1>
            <p class="subtitle">现代化代理订阅服务</p>
        </div>

        <div class="glass-card">
            <h2 class="card-title">订阅链接</h2>
            <div class="subscription-grid">
                <div class="sub-item">
                    <div class="sub-label">自适应订阅</div>
                    <div class="sub-link" onclick="copyToClipboard('https://${proxyhost}${hostName}/${password}','qrcode_0')">
                        https://${proxyhost}${hostName}/${password}
                    </div>
                    <div id="qrcode_0" class="qr-container"></div>
                </div>

                <div class="sub-item">
                    <div class="sub-label">Base64 订阅</div>
                    <div class="sub-link" onclick="copyToClipboard('https://${proxyhost}${hostName}/${password}?b64','qrcode_1')">
                        https://${proxyhost}${hostName}/${password}?b64
                    </div>
                    <div id="qrcode_1" class="qr-container"></div>
                </div>

                <div class="sub-item">
                    <div class="sub-label">Clash 订阅</div>
                    <div class="sub-link" onclick="copyToClipboard('https://${proxyhost}${hostName}/${password}?clash','qrcode_2')">
                        https://${proxyhost}${hostName}/${password}?clash
                    </div>
                    <div id="qrcode_2" class="qr-container"></div>
                </div>

                <div class="sub-item">
                    <div class="sub-label">Sing-box 订阅</div>
                    <div class="sub-link" onclick="copyToClipboard('https://${proxyhost}${hostName}/${password}?sb','qrcode_3')">
                        https://${proxyhost}${hostName}/${password}?sb
                    </div>
                    <div id="qrcode_3" class="qr-container"></div>
                </div>

                <div class="sub-item">
                    <div class="sub-label">Loon 订阅</div>
                    <div class="sub-link" onclick="copyToClipboard('https://${proxyhost}${hostName}/${password}?loon','qrcode_5')">
                        https://${proxyhost}${hostName}/${password}?loon
                    </div>
                    <div id="qrcode_5" class="qr-container"></div>
                </div>

                ${hostName.includes(".workers.dev") ? '' : `
                <div class="sub-item">
                    <div class="sub-label">Surge 订阅</div>
                    <div class="sub-link" onclick="copyToClipboard('https://${proxyhost}${hostName}/${password}?surge','qrcode_4')">
                        https://${proxyhost}${hostName}/${password}?surge
                    </div>
                    <div id="qrcode_4" class="qr-container"></div>
                </div>
                `}
            </div>

            <button class="toggle-btn" id="noticeToggle" onclick="toggleNotice()">
                💡 实用订阅技巧
            </button>

            <div id="noticeContent" class="notice-content" style="display: none;">
                <p><strong>1.</strong> PassWall/PassWall2 用户：设置 User-Agent 为 "PassWall"</p>
                <p><strong>2.</strong> SSR+ 用户：推荐使用 Base64 订阅地址</p>
                <p><strong>3.</strong> 快速切换订阅生成器：添加 ?sub=sub.google.com 参数</p>
                <p><strong>4.</strong> 快速更换 ProxyIP：添加 ?proxyip=your-proxy-ip 参数</p>
                <p><strong>5.</strong> 快速更换 SOCKS5：添加 ?socks5=user:pass@ip:port 参数</p>
                <p><strong>6.</strong> 多参数使用 & 连接，如：?sub=xxx&proxyip=xxx</p>
            </div>
        </div>

        <div class="glass-card">
            <h2 class="card-title">配置信息</h2>
            <div class="config-info">
                <div class="config-item"><span class="config-label">HOST:</span> ${hostName}</div>
                <div class="config-item"><span class="config-label">PASSWORD:</span> ${password}</div>
                <div class="config-item"><span class="config-label">SHA224:</span> ${sha224Password}</div>
                <div class="config-item"><span class="config-label">FAKEPASS:</span> ${fakeUserID}</div>
                <div class="config-item"><span class="config-label">UA:</span> ${UA}</div>
                <div class="config-item"><span class="config-label">SCV:</span> ${SCV}</div>
                <div class="config-item"><span class="config-label">订阅器:</span> ${订阅器.replace(/<br>/g, ' | ')}</div>
                <div class="config-item"><span class="config-label">SUBAPI:</span> ${subProtocol}://${subConverter}</div>
                <div class="config-item"><span class="config-label">SUBCONFIG:</span> ${subConfig}</div>
            </div>
        </div>

        <div class="glass-card">
            <h2 class="card-title">V2Ray 配置</h2>
            <div class="sub-item">
                <div class="sub-link" onclick="copyToClipboard('${v2ray}','qrcode_v2ray')" style="font-family: monospace; font-size: 0.8rem;">
                    ${v2ray}
                </div>
                <div id="qrcode_v2ray" class="qr-container"></div>
            </div>
        </div>

        <div class="glass-card">
            <h2 class="card-title">Clash Meta 配置</h2>
            <div class="config-info">
                <pre style="color: rgba(255,255,255,0.9); font-size: 0.8rem; white-space: pre-wrap;">${clash}</pre>
            </div>
        </div>

        <div class="footer">
            ${cmad}
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
    <script>
        function copyToClipboard(text, qrcode) {
            navigator.clipboard.writeText(text).then(() => {
                // 创建现代化的提示
                const toast = document.createElement('div');
                toast.innerHTML = '✅ 已复制到剪贴板';
                toast.style.cssText = \`
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    color: #333;
                    padding: 15px 25px;
                    border-radius: 25px;
                    font-weight: 600;
                    z-index: 10000;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    animation: slideIn 0.3s ease;
                \`;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => document.body.removeChild(toast), 300);
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
            });

            const qrcodeDiv = document.getElementById(qrcode);
            qrcodeDiv.innerHTML = '';
            new QRCode(qrcodeDiv, {
                text: text,
                width: 200,
                height: 200,
                colorDark: "#333333",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.Q
            });
        }

        function toggleNotice() {
            const noticeContent = document.getElementById('noticeContent');
            const noticeToggle = document.getElementById('noticeToggle');
            if (noticeContent.style.display === 'none') {
                noticeContent.style.display = 'block';
                noticeToggle.innerHTML = '💡 收起技巧';
            } else {
                noticeContent.style.display = 'none';
                noticeToggle.innerHTML = '💡 实用订阅技巧';
            }
        }

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>
            `;
        return 节点配置页;
    } else {
        if (typeof fetch != 'function') {
            return 'Error: fetch is not available in this environment.';
        }
        // 如果是使用默认域名，则改成一个workers的域名，订阅器会加上代理
        if (hostName.includes(".workers.dev")) {
            fakeHostName = `${fakeHostName}.workers.dev`;
        } else {
            fakeHostName = `${fakeHostName}.xyz`
        }

        let url = `https://${sub}/sub?host=${fakeHostName}&pw=${fakeUserID}&password=${fakeUserID + atob('JmVwZWl1cz1jbWxpdSZwcm94eWlwPQ==') + RproxyIP}&path=${encodeURIComponent(path)}`;
        let isBase64 = true;
        let newAddressesapi = [];
        let newAddressescsv = [];

        if (!sub || sub == "") {
            if (hostName.includes('workers.dev')) {
                if (proxyhostsURL && (!proxyhosts || proxyhosts.length == 0)) {
                    try {
                        const response = await fetch(proxyhostsURL);

                        if (!response.ok) {
                            console.error('获取地址时出错:', response.status, response.statusText);
                            return; // 如果有错误，直接返回
                        }

                        const text = await response.text();
                        const lines = text.split('\n');
                        // 过滤掉空行或只包含空白字符的行
                        const nonEmptyLines = lines.filter(line => line.trim() !== '');

                        proxyhosts = proxyhosts.concat(nonEmptyLines);
                    } catch (error) {
                        console.error('获取地址时出错:', error);
                    }
                }
                // 使用Set对象去重
                proxyhosts = [...new Set(proxyhosts)];
            }

            newAddressesapi = await getAddressesapi(addressesapi);
            newAddressescsv = await getAddressescsv('TRUE');
            url = `https://${hostName}/${fakeUserID + _url.search}`;
        }

        if (!userAgent.includes(('CF-Workers-SUB').toLowerCase()) && !_url.searchParams.has('b64') && !_url.searchParams.has('base64')) {
            if ((userAgent.includes('clash') && !userAgent.includes('nekobox')) || (_url.searchParams.has('clash'))) {
                url = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(url)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=${subEmoji}&list=false&tfo=false&scv=${SCV}&fdn=false&sort=false&new_name=true`;
                isBase64 = false;
            } else if (userAgent.includes('sing-box') || userAgent.includes('singbox') || _url.searchParams.has('singbox') || _url.searchParams.has('sb')) {
                url = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(url)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=${subEmoji}&list=false&tfo=false&scv=${SCV}&fdn=false&sort=false&new_name=true`;
                isBase64 = false;
            } else if (userAgent.includes('surge') || _url.searchParams.has('surge')) {
                url = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(url)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=${subEmoji}&list=false&xudp=false&udp=false&tfo=false&expand=true&scv=${SCV}&fdn=false`;
                isBase64 = false;
            } else if (userAgent.includes('loon') || _url.searchParams.has('loon')) {
                url = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(url)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=${subEmoji}&list=false&tfo=false&scv=${SCV}&fdn=false&sort=false&new_name=true`;
                isBase64 = false;
            }
        }

        try {
            let content;
            if ((!sub || sub == "") && isBase64 == true) {
                content = await subAddresses(fakeHostName, fakeUserID, userAgent, newAddressesapi, newAddressescsv);
            } else {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': atob('Q0YtV29ya2Vycy1lcGVpdXMvY21saXU='),
                    }
                });
                content = await response.text();
            }

            if (_url.pathname == `/${fakeUserID}`) return content;

            content = revertFakeInfo(content, password, hostName, fakeUserID, fakeHostName, isBase64);
            if (userAgent.includes('surge') || _url.searchParams.has('surge')) content = surge(content, `https://${hostName}/${password}?surge`);
            return content;
        } catch (error) {
            console.error('Error fetching content:', error);
            return `Error fetching content: ${error.message}`;
        }
    }
}

async function sendMessage(type, ip, add_data = "") {
    if (BotToken !== '' && ChatID !== '') {
        let msg = "";
        const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
        if (response.status == 200) {
            const ipInfo = await response.json();
            msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
        } else {
            msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
        }

        let url = "https://api.telegram.org/bot" + BotToken + "/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
        return fetch(url, {
            method: 'get',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
            }
        });
    }
}

/**
 * 
 * @param {number} addressType
 * @param {string} addressRemote
 * @param {number} portRemote
 * @param {function} log The logging function.
 */
async function socks5Connect(addressType, addressRemote, portRemote, log) {
    const { username, password, hostname, port } = parsedSocks5Address;
    // Connect to the SOCKS server
    const socket = connect({
        hostname,
        port,
    });

    // Request head format (Worker -> Socks Server):
    // +----+----------+----------+
    // |VER | NMETHODS | METHODS  |
    // +----+----------+----------+
    // | 1  |	1	 | 1 to 255 |
    // +----+----------+----------+

    // https://en.wikipedia.org/wiki/SOCKS#SOCKS5
    // For METHODS:
    // 0x00 NO AUTHENTICATION REQUIRED
    // 0x02 USERNAME/PASSWORD https://datatracker.ietf.org/doc/html/rfc1929
    const socksGreeting = new Uint8Array([5, 2, 0, 2]);

    const writer = socket.writable.getWriter();

    await writer.write(socksGreeting);
    log('sent socks greeting');

    const reader = socket.readable.getReader();
    const encoder = new TextEncoder();
    let res = (await reader.read()).value;
    // Response format (Socks Server -> Worker):
    // +----+--------+
    // |VER | METHOD |
    // +----+--------+
    // | 1  |   1	|
    // +----+--------+
    if (res[0] !== 0x05) {
        log(`socks server version error: ${res[0]} expected: 5`);
        return;
    }
    if (res[1] === 0xff) {
        log("no acceptable methods");
        return;
    }

    // if return 0x0502
    if (res[1] === 0x02) {
        log("socks server needs auth");
        if (!username || !password) {
            log("please provide username/password");
            return;
        }
        // +----+------+----------+------+----------+
        // |VER | ULEN |  UNAME   | PLEN |  PASSWD  |
        // +----+------+----------+------+----------+
        // | 1  |  1   | 1 to 255 |  1   | 1 to 255 |
        // +----+------+----------+------+----------+
        const authRequest = new Uint8Array([
            1,
            username.length,
            ...encoder.encode(username),
            password.length,
            ...encoder.encode(password)
        ]);
        await writer.write(authRequest);
        res = (await reader.read()).value;
        // expected 0x0100
        if (res[0] !== 0x01 || res[1] !== 0x00) {
            log("fail to auth socks server");
            return;
        }
    }

    // Request data format (Worker -> Socks Server):
    // +----+-----+-------+------+----------+----------+
    // |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
    // +----+-----+-------+------+----------+----------+
    // | 1  |  1  | X'00' |  1   | Variable |	2	 |
    // +----+-----+-------+------+----------+----------+
    // ATYP: address type of following address
    // 0x01: IPv4 address
    // 0x03: Domain name
    // 0x04: IPv6 address
    // DST.ADDR: desired destination address
    // DST.PORT: desired destination port in network octet order

    // addressType
    // 0x01: IPv4 address
    // 0x03: Domain name
    // 0x04: IPv6 address
    // 1--> ipv4  addressLength =4
    // 2--> domain name
    // 3--> ipv6  addressLength =16
    let DSTADDR;	// DSTADDR = ATYP + DST.ADDR
    switch (addressType) {
        case 1:
            DSTADDR = new Uint8Array(
                [1, ...addressRemote.split('.').map(Number)]
            );
            break;
        case 3:
            DSTADDR = new Uint8Array(
                [3, addressRemote.length, ...encoder.encode(addressRemote)]
            );
            break;
        case 4:
            DSTADDR = new Uint8Array(
                [4, ...addressRemote.split(':').flatMap(x => [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)])]
            );
            break;
        default:
            log(`invild  addressType is ${addressType}`);
            return;
    }
    const socksRequest = new Uint8Array([5, 1, 0, ...DSTADDR, portRemote >> 8, portRemote & 0xff]);
    await writer.write(socksRequest);
    log('sent socks request');

    res = (await reader.read()).value;
    // Response format (Socks Server -> Worker):
    //  +----+-----+-------+------+----------+----------+
    // |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
    // +----+-----+-------+------+----------+----------+
    // | 1  |  1  | X'00' |  1   | Variable |	2	 |
    // +----+-----+-------+------+----------+----------+
    if (res[1] === 0x00) {
        log("socks connection opened");
    } else {
        log("fail to open socks connection");
        return;
    }
    writer.releaseLock();
    reader.releaseLock();
    return socket;
}

/**
 * 建立 HTTP 代理连接
 * @param {string} addressRemote 目标地址（可以是 IP 或域名）
 * @param {number} portRemote 目标端口
 * @param {function} log 日志记录函数
 */
async function httpConnect(addressRemote, portRemote, log) {
    const { username, password, hostname, port } = parsedSocks5Address;
    const sock = await connect({
        hostname: hostname,
        port: port
    });

    // 构建HTTP CONNECT请求
    let connectRequest = `CONNECT ${addressRemote}:${portRemote} HTTP/1.1\r\n`;
    connectRequest += `Host: ${addressRemote}:${portRemote}\r\n`;

    // 添加代理认证（如果需要）
    if (username && password) {
        const authString = `${username}:${password}`;
        const base64Auth = btoa(authString);
        connectRequest += `Proxy-Authorization: Basic ${base64Auth}\r\n`;
    }

    connectRequest += `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n`;
    connectRequest += `Proxy-Connection: Keep-Alive\r\n`;
    connectRequest += `Connection: Keep-Alive\r\n`; // 添加标准 Connection 头
    connectRequest += `\r\n`;

    log(`正在连接到 ${addressRemote}:${portRemote} 通过代理 ${hostname}:${port}`);

    try {
        // 发送连接请求
        const writer = sock.writable.getWriter();
        await writer.write(new TextEncoder().encode(connectRequest));
        writer.releaseLock();
    } catch (err) {
        console.error('发送HTTP CONNECT请求失败:', err);
        throw new Error(`发送HTTP CONNECT请求失败: ${err.message}`);
    }

    // 读取HTTP响应
    const reader = sock.readable.getReader();
    let respText = '';
    let connected = false;
    let responseBuffer = new Uint8Array(0);

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                console.error('HTTP代理连接中断');
                throw new Error('HTTP代理连接中断');
            }

            // 合并接收到的数据
            const newBuffer = new Uint8Array(responseBuffer.length + value.length);
            newBuffer.set(responseBuffer);
            newBuffer.set(value, responseBuffer.length);
            responseBuffer = newBuffer;

            // 将收到的数据转换为文本
            respText = new TextDecoder().decode(responseBuffer);

            // 检查是否收到完整的HTTP响应头
            if (respText.includes('\r\n\r\n')) {
                // 分离HTTP头和可能的数据部分
                const headersEndPos = respText.indexOf('\r\n\r\n') + 4;
                const headers = respText.substring(0, headersEndPos);

                log(`收到HTTP代理响应: ${headers.split('\r\n')[0]}`);

                // 检查响应状态
                if (headers.startsWith('HTTP/1.1 200') || headers.startsWith('HTTP/1.0 200')) {
                    connected = true;

                    // 如果响应头之后还有数据，我们需要保存这些数据以便后续处理
                    if (headersEndPos < responseBuffer.length) {
                        const remainingData = responseBuffer.slice(headersEndPos);
                        // 创建一个缓冲区来存储这些数据，以便稍后使用
                        const dataStream = new ReadableStream({
                            start(controller) {
                                controller.enqueue(remainingData);
                            }
                        });

                        // 创建一个新的TransformStream来处理额外数据
                        const { readable, writable } = new TransformStream();
                        dataStream.pipeTo(writable).catch(err => console.error('处理剩余数据错误:', err));

                        // 替换原始readable流
                        // @ts-ignore
                        sock.readable = readable;
                    }
                } else {
                    const errorMsg = `HTTP代理连接失败: ${headers.split('\r\n')[0]}`;
                    console.error(errorMsg);
                    throw new Error(errorMsg);
                }
                break;
            }
        }
    } catch (err) {
        reader.releaseLock();
        throw new Error(`处理HTTP代理响应失败: ${err.message}`);
    }

    reader.releaseLock();

    if (!connected) {
        throw new Error('HTTP代理连接失败: 未收到成功响应');
    }

    log(`HTTP代理连接成功: ${addressRemote}:${portRemote}`);
    return sock;
}

/**
 * 
 * @param {string} address
 */
function socks5AddressParser(address) {
    let [latter, former] = address.split("@").reverse();
    let username, password, hostname, port;
    if (former) {
        const formers = former.split(":");
        if (formers.length !== 2) {
            throw new Error('Invalid SOCKS address format');
        }
        [username, password] = formers;
    }
    const latters = latter.split(":");
    port = Number(latters.pop());
    if (isNaN(port)) {
        throw new Error('Invalid SOCKS address format');
    }
    hostname = latters.join(":");
    const regex = /^\[.*\]$/;
    if (hostname.includes(":") && !regex.test(hostname)) {
        throw new Error('Invalid SOCKS address format');
    }
    //if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(hostname)) hostname = `${atob('d3d3Lg==')}${hostname}${atob('LmlwLjA5MDIyNy54eXo=')}`;
    return {
        username,
        password,
        hostname,
        port,
    }
}

function isValidIPv4(address) {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(address);
}

function subAddresses(host, pw, userAgent, newAddressesapi, newAddressescsv) {
    addresses = addresses.concat(newAddressesapi);
    addresses = addresses.concat(newAddressescsv);
    // 使用Set对象去重
    const uniqueAddresses = [...new Set(addresses)];

    const responseBody = uniqueAddresses.map(address => {
        let port = "-1";
        let addressid = address;

        const match = addressid.match(regex);
        if (!match) {
            if (address.includes(':') && address.includes('#')) {
                const parts = address.split(':');
                address = parts[0];
                const subParts = parts[1].split('#');
                port = subParts[0];
                addressid = subParts[1];
            } else if (address.includes(':')) {
                const parts = address.split(':');
                address = parts[0];
                port = parts[1];
            } else if (address.includes('#')) {
                const parts = address.split('#');
                address = parts[0];
                addressid = parts[1];
            }

            if (addressid.includes(':')) {
                addressid = addressid.split(':')[0];
            }
        } else {
            address = match[1];
            port = match[2] || port;
            addressid = match[3] || address;
        }

        const httpsPorts = ["2053", "2083", "2087", "2096", "8443"];
        if (!isValidIPv4(address) && port == "-1") {
            for (let httpsPort of httpsPorts) {
                if (address.includes(httpsPort)) {
                    port = httpsPort;
                    break;
                }
            }
        }
        if (port == "-1") port = "443";

        let 伪装域名 = host;
        let 最终路径 = path;
        let 节点备注 = '';
        const matchingProxyIP = proxyIPPool.find(proxyIP => proxyIP.includes(address));
        if (matchingProxyIP) 最终路径 = `/proxyip=${matchingProxyIP}`;

        if (proxyhosts.length > 0 && (伪装域名.includes('.workers.dev'))) {
            最终路径 = `/${伪装域名}${最终路径}`;
            伪装域名 = proxyhosts[Math.floor(Math.random() * proxyhosts.length)];
            节点备注 = ` 已启用临时域名中转服务，请尽快绑定自定义域！`;
        }

        let 密码 = pw;
        if (!userAgent.includes('subconverter')) 密码 = encodeURIComponent(pw);

        const 啥啥啥_写的这是啥啊 = 'dHJvamFu';
        const 协议类型 = atob(啥啥啥_写的这是啥啊);
        const 特洛伊Link = `${协议类型}://${密码}@${address}:${port}?security=tls&sni=${伪装域名}&fp=randomized&type=ws&host=${伪装域名}&path=${encodeURIComponent(最终路径) + allowInsecure}&fragment=1,40-60,30-50,tlshello#${encodeURIComponent(addressid + 节点备注)}`;

        return 特洛伊Link;
    }).join('\n');

    let base64Response = responseBody; // 重新进行 Base64 编码
    if (link.length > 0) base64Response += '\n' + link.join('\n');
    return btoa(base64Response);
}

async function getAddressesapi(api) {
    if (!api || api.length === 0) return [];

    let newapi = "";

    // 创建一个AbortController对象，用于控制fetch请求的取消
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort(); // 取消所有请求
    }, 2000); // 2秒后触发

    try {
        // 使用Promise.allSettled等待所有API请求完成，无论成功或失败
        // 对api数组进行遍历，对每个API地址发起fetch请求
        const responses = await Promise.allSettled(api.map(apiUrl => fetch(apiUrl, {
            method: 'get',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;',
                'User-Agent': atob('Q0YtV29ya2Vycy1lcGVpdXMvY21saXU=')
            },
            signal: controller.signal // 将AbortController的信号量添加到fetch请求中，以便于需要时可以取消请求
        }).then(response => response.ok ? response.text() : Promise.reject())));

        // 遍历所有响应
        for (const [index, response] of responses.entries()) {
            // 检查响应状态是否为'fulfilled'，即请求成功完成
            if (response.status === 'fulfilled') {
                // 获取响应的内容
                const content = await response.value;

                const lines = content.split(/\r?\n/);
                let 节点备注 = '';
                let 测速端口 = '443';
                if (lines[0].split(',').length > 3) {
                    const idMatch = api[index].match(/id=([^&]*)/);
                    if (idMatch) 节点备注 = idMatch[1];
                    const portMatch = api[index].match(/port=([^&]*)/);
                    if (portMatch) 测速端口 = portMatch[1];

                    for (let i = 1; i < lines.length; i++) {
                        const columns = lines[i].split(',')[0];
                        if (columns) {
                            newapi += `${columns}:${测速端口}${节点备注 ? `#${节点备注}` : ''}\n`;
                            if (api[index].includes('proxyip=true')) proxyIPPool.push(`${columns}:${测速端口}`);
                        }
                    }
                } else {
                    // 验证当前apiUrl是否带有'proxyip=true'
                    if (api[index].includes('proxyip=true')) {
                        // 如果URL带有'proxyip=true'，则将内容添加到proxyIPPool
                        proxyIPPool = proxyIPPool.concat((await ADD(content)).map(item => {
                            const baseItem = item.split('#')[0] || item;
                            if (baseItem.includes(':')) {
                                const port = baseItem.split(':')[1];
                                if (!httpsPorts.includes(port)) {
                                    return baseItem;
                                }
                            } else {
                                return `${baseItem}:443`;
                            }
                            return null; // 不符合条件时返回 null
                        }).filter(Boolean)); // 过滤掉 null 值
                    }
                    // 将内容添加到newapi中
                    newapi += content + '\n';
                }
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        // 无论成功或失败，最后都清除设置的超时定时器
        clearTimeout(timeout);
    }

    const newAddressesapi = await ADD(newapi);

    // 返回处理后的结果
    return newAddressesapi;
}

async function getAddressescsv(tls) {
    if (!addressescsv || addressescsv.length === 0) {
        return [];
    }

    let newAddressescsv = [];

    for (const csvUrl of addressescsv) {
        try {
            const response = await fetch(csvUrl);

            if (!response.ok) {
                console.error('获取CSV地址时出错:', response.status, response.statusText);
                continue;
            }

            const text = await response.text();// 使用正确的字符编码解析文本内容
            let lines;
            if (text.includes('\r\n')) {
                lines = text.split('\r\n');
            } else {
                lines = text.split('\n');
            }

            // 检查CSV头部是否包含必需字段
            const header = lines[0].split(',');
            const tlsIndex = header.indexOf('TLS');

            const ipAddressIndex = 0;// IP地址在 CSV 头部的位置
            const portIndex = 1;// 端口在 CSV 头部的位置
            const dataCenterIndex = tlsIndex + remarkIndex; // 数据中心是 TLS 的后一个字段

            if (tlsIndex === -1) {
                console.error('CSV文件缺少必需的字段');
                continue;
            }

            // 从第二行开始遍历CSV行
            for (let i = 1; i < lines.length; i++) {
                const columns = lines[i].split(',');
                const speedIndex = columns.length - 1; // 最后一个字段
                // 检查TLS是否为"TRUE"且速度大于DLS
                if (columns[tlsIndex].toUpperCase() === tls && parseFloat(columns[speedIndex]) > DLS) {
                    const ipAddress = columns[ipAddressIndex];
                    const port = columns[portIndex];
                    const dataCenter = columns[dataCenterIndex];

                    const formattedAddress = `${ipAddress}:${port}#${dataCenter}`;
                    newAddressescsv.push(formattedAddress);
                    if (csvUrl.includes('proxyip=true') && columns[tlsIndex].toUpperCase() == 'true' && !httpsPorts.includes(port)) {
                        // 如果URL带有'proxyip=true'，则将内容添加到proxyIPPool
                        proxyIPPool.push(`${ipAddress}:${port}`);
                    }
                }
            }
        } catch (error) {
            console.error('获取CSV地址时出错:', error);
            continue;
        }
    }

    return newAddressescsv;
}

function surge(content, url) {
    let 每行内容;
    if (content.includes('\r\n')) {
        每行内容 = content.split('\r\n');
    } else {
        每行内容 = content.split('\n');
    }

    let 输出内容 = "";
    for (let x of 每行内容) {
        if (x.includes(atob('PSB0cm9qYW4s'))) {
            const host = x.split("sni=")[1].split(",")[0];
            const 备改内容 = `skip-cert-verify=true, tfo=false, udp-relay=false`;
            const 正确内容 = `skip-cert-verify=true, ws=true, ws-path=${path}, ws-headers=Host:"${host}", tfo=false, udp-relay=false`;
            输出内容 += x.replace(new RegExp(备改内容, 'g'), 正确内容).replace("[", "").replace("]", "") + '\n';
        } else {
            输出内容 += x + '\n';
        }
    }

    输出内容 = `#!MANAGED-CONFIG ${url} interval=86400 strict=false` + 输出内容.substring(输出内容.indexOf('\n'));
    return 输出内容;
}

/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 * 
 * @version 0.11.0 (modified by cmliu)
 * @description 本代码基于 js-sha256 项目改编，添加了 SHA-224 哈希算法的实现。
 * @author Chen, Yi-Cyuan [emn178@gmail.com], modified by cmliu
 * @copyright Chen, Yi-Cyuan 2014-2024
 * @license MIT
 * 
 * @modifications 重写并实现了 sha224 函数，引用请注明出处。修改日期：2024-12-04，Github：cmliu
 */
function sha224(输入字符串) {
    // 内部常量和函数
    const 常量K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    function utf8编码(字符串) {
        return unescape(encodeURIComponent(字符串));
    }

    function 字节转十六进制(字节数组) {
        let 十六进制 = '';
        for (let i = 0; i < 字节数组.length; i++) {
            十六进制 += ((字节数组[i] >>> 4) & 0x0F).toString(16);
            十六进制 += (字节数组[i] & 0x0F).toString(16);
        }
        return 十六进制;
    }

    function sha224核心(输入字符串) {
        // SHA-224的初始哈希值
        let 哈希值 = [
            0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
            0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
        ];

        // 预处理
        const 消息长度 = 输入字符串.length * 8;
        输入字符串 += String.fromCharCode(0x80);
        while ((输入字符串.length * 8) % 512 !== 448) {
            输入字符串 += String.fromCharCode(0);
        }

        // 64位消息长度
        const 消息长度高位 = Math.floor(消息长度 / 0x100000000);
        const 消息长度低位 = 消息长度 & 0xFFFFFFFF;
        输入字符串 += String.fromCharCode(
            (消息长度高位 >>> 24) & 0xFF, (消息长度高位 >>> 16) & 0xFF,
            (消息长度高位 >>> 8) & 0xFF, 消息长度高位 & 0xFF,
            (消息长度低位 >>> 24) & 0xFF, (消息长度低位 >>> 16) & 0xFF,
            (消息长度低位 >>> 8) & 0xFF, 消息长度低位 & 0xFF
        );

        const 字数组 = [];
        for (let i = 0; i < 输入字符串.length; i += 4) {
            字数组.push(
                (输入字符串.charCodeAt(i) << 24) |
                (输入字符串.charCodeAt(i + 1) << 16) |
                (输入字符串.charCodeAt(i + 2) << 8) |
                输入字符串.charCodeAt(i + 3)
            );
        }

        // 主要压缩循环
        for (let i = 0; i < 字数组.length; i += 16) {
            const w = new Array(64).fill(0);
            for (let j = 0; j < 16; j++) {
                w[j] = 字数组[i + j];
            }

            for (let j = 16; j < 64; j++) {
                const s0 = 右旋转(w[j - 15], 7) ^ 右旋转(w[j - 15], 18) ^ (w[j - 15] >>> 3);
                const s1 = 右旋转(w[j - 2], 17) ^ 右旋转(w[j - 2], 19) ^ (w[j - 2] >>> 10);
                w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
            }

            let [a, b, c, d, e, f, g, h0] = 哈希值;

            for (let j = 0; j < 64; j++) {
                const S1 = 右旋转(e, 6) ^ 右旋转(e, 11) ^ 右旋转(e, 25);
                const ch = (e & f) ^ (~e & g);
                const temp1 = (h0 + S1 + ch + 常量K[j] + w[j]) >>> 0;
                const S0 = 右旋转(a, 2) ^ 右旋转(a, 13) ^ 右旋转(a, 22);
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const temp2 = (S0 + maj) >>> 0;

                h0 = g;
                g = f;
                f = e;
                e = (d + temp1) >>> 0;
                d = c;
                c = b;
                b = a;
                a = (temp1 + temp2) >>> 0;
            }

            哈希值[0] = (哈希值[0] + a) >>> 0;
            哈希值[1] = (哈希值[1] + b) >>> 0;
            哈希值[2] = (哈希值[2] + c) >>> 0;
            哈希值[3] = (哈希值[3] + d) >>> 0;
            哈希值[4] = (哈希值[4] + e) >>> 0;
            哈希值[5] = (哈希值[5] + f) >>> 0;
            哈希值[6] = (哈希值[6] + g) >>> 0;
            哈希值[7] = (哈希值[7] + h0) >>> 0;
        }

        // 截断到224位
        return 哈希值.slice(0, 7);
    }

    function 右旋转(数值, 位数) {
        return ((数值 >>> 位数) | (数值 << (32 - 位数))) >>> 0;
    }

    // 主函数逻辑
    const 编码输入 = utf8编码(输入字符串);
    const 哈希结果 = sha224核心(编码输入);

    // 转换为十六进制字符串
    return 字节转十六进制(
        哈希结果.flatMap(h => [
            (h >>> 24) & 0xFF,
            (h >>> 16) & 0xFF,
            (h >>> 8) & 0xFF,
            h & 0xFF
        ])
    );
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
    const 旧数据 = await env.KV.get(`/${txt}`);
    const 新数据 = await env.KV.get(txt);

    if (旧数据 && !新数据) {
        // 写入新位置
        await env.KV.put(txt, 旧数据);
        // 删除旧数据
        await env.KV.delete(`/${txt}`);
        return true;
    }
    return false;
}

async function KV(request, env, txt = 'ADD.txt') {
    try {
        // POST请求处理
        if (request.method === "POST") {
            if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
            try {
                const content = await request.text();
                await env.KV.put(txt, content);
                return new Response("保存成功");
            } catch (error) {
                console.error('保存KV时发生错误:', error);
                return new Response("保存失败: " + error.message, { status: 500 });
            }
        }

        // GET请求部分
        let content = '';
        let hasKV = !!env.KV;

        if (hasKV) {
            try {
                content = await env.KV.get(txt) || '';
            } catch (error) {
                console.error('读取KV时发生错误:', error);
                content = '读取数据时发生错误: ' + error.message;
            }
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>优选订阅列表</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        margin: 0;
                        padding: 15px; /* 调整padding */
                        box-sizing: border-box;
                        font-size: 13px; /* 设置全局字体大小 */
                    }
                    .editor-container {
                        width: 100%;
                        max-width: 100%;
                        margin: 0 auto;
                    }
                    .editor {
                        width: 100%;
                        height: 520px; /* 调整高度 */
                        margin: 15px 0; /* 调整margin */
                        padding: 10px; /* 调整padding */
                        box-sizing: border-box;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        font-size: 13px;
                        line-height: 1.5;
                        overflow-y: auto;
                        resize: none;
                    }
                    .save-container {
                        margin-top: 8px; /* 调整margin */
                        display: flex;
                        align-items: center;
                        gap: 10px; /* 调整gap */
                    }
                    .save-btn, .back-btn {
                        padding: 6px 15px; /* 调整padding */
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .save-btn {
                        background: #4CAF50;
                    }
                    .save-btn:hover {
                        background: #45a049;
                    }
                    .back-btn {
                        background: #666;
                    }
                    .back-btn:hover {
                        background: #555;
                    }
                    .bestip-btn {
                        background: #2196F3;
                        padding: 6px 15px;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .bestip-btn:hover {
                        background: #1976D2;
                    }
                    .save-status {
                        color: #666;
                    }
                    .notice-content {
                        display: none;
                        margin-top: 10px;
                        font-size: 13px;
                        color: #333;
                    }
                </style>
            </head>
            <body>
                ################################################################<br>
                ${FileName} 优选订阅列表:<br>
                ---------------------------------------------------------------<br>
                &nbsp;&nbsp;<strong><a href="javascript:void(0);" id="noticeToggle" onclick="toggleNotice()">注意事项∨</a></strong><br>
                <div id="noticeContent" class="notice-content">
                    ${decodeURIComponent(atob('JTA5JTA5JTA5JTA5JTA5JTNDc3Ryb25nJTNFMS4lM0MlMkZzdHJvbmclM0UlMjBBRERBUEklMjAlRTUlQTYlODIlRTYlOUUlOUMlRTYlOTglQUYlRTUlOEYlOEQlRTQlQkIlQTNJUCVFRiVCQyU4QyVFNSU4RiVBRiVFNCVCRCU5QyVFNCVCOCVCQVBST1hZSVAlRTclOUElODQlRTglQUYlOUQlRUYlQkMlOEMlRTUlOEYlQUYlRTUlQjAlODYlMjIlM0Zwcm94eWlwJTNEdHJ1ZSUyMiVFNSU4RiU4MiVFNiU5NSVCMCVFNiVCNyVCQiVFNSU4QSVBMCVFNSU4OCVCMCVFOSU5MyVCRSVFNiU4RSVBNSVFNiU5QyVBQiVFNSVCMCVCRSVFRiVCQyU4QyVFNCVCRSU4QiVFNSVBNiU4MiVFRiVCQyU5QSUzQ2JyJTNFCiUwOSUwOSUwOSUwOSUwOSUyNm5ic3AlM0IlMjZuYnNwJTNCaHR0cHMlM0ElMkYlMkZyYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tJTJGY21saXUlMkZXb3JrZXJWbGVzczJzdWIlMkZtYWluJTJGYWRkcmVzc2VzYXBpLnR4dCUzQ3N0cm9uZyUzRSUzRnByb3h5aXAlM0R0cnVlJTNDJTJGc3Ryb25nJTNFJTNDYnIlM0UlM0NiciUzRQolMDklMDklMDklMDklMDklM0NzdHJvbmclM0UyLiUzQyUyRnN0cm9uZyUzRSUyMEFEREFQSSUyMCVFNSVBNiU4MiVFNiU5RSU5QyVFNiU5OCVBRiUyMCUzQ2ElMjBocmVmJTNEJTI3aHR0cHMlM0ElMkYlMkZnaXRodWIuY29tJTJGWElVMiUyRkNsb3VkZmxhcmVTcGVlZFRlc3QlMjclM0VDbG91ZGZsYXJlU3BlZWRUZXN0JTNDJTJGYSUzRSUyMCVFNyU5QSU4NCUyMGNzdiUyMCVFNyVCQiU5MyVFNiU5RSU5QyVFNiU5NiU4NyVFNCVCQiVCNiVFRiVCQyU4QyVFNCVCRSU4QiVFNSVBNiU4MiVFRiVCQyU5QSUzQ2JyJTNFCiUwOSUwOSUwOSUwOSUwOSUyNm5ic3AlM0IlMjZuYnNwJTNCaHR0cHMlM0ElMkYlMkZyYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tJTJGY21saXUlMkZXb3JrZXJWbGVzczJzdWIlMkZtYWluJTJGQ2xvdWRmbGFyZVNwZWVkVGVzdC5jc3YlM0NiciUzRSUzQ2JyJTNFCiUwOSUwOSUwOSUwOSUwOSUyNm5ic3AlM0IlMjZuYnNwJTNCLSUyMCVFNSVBNiU4MiVFOSU5QyU4MCVFNiU4QyU4NyVFNSVBRSU5QTIwNTMlRTclQUIlQUYlRTUlOEYlQTMlRTUlOEYlQUYlRTUlQjAlODYlMjIlM0Zwb3J0JTNEMjA1MyUyMiVFNSU4RiU4MiVFNiU5NSVCMCVFNiVCNyVCQiVFNSU4QSVBMCVFNSU4OCVCMCVFOSU5MyVCRSVFNiU4RSVBNSVFNiU5QyVBQiVFNSVCMCVCRSVFRiVCQyU4QyVFNCVCRSU4QiVFNSVBNiU4MiVFRiVCQyU5QSUzQ2JyJTNFCiUwOSUwOSUwOSUwOSUwOSUyNm5ic3AlM0IlMjZuYnNwJTNCaHR0cHMlM0ElMkYlMkZyYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tJTJGY21saXUlMkZXb3JrZXJWbGVzczJzdWIlMkZtYWluJTJGQ2xvdWRmbGFyZVNwZWVkVGVzdC5jc3YlM0NzdHJvbmclM0UlM0Zwb3J0JTNEMjA1MyUzQyUyRnN0cm9uZyUzRSUzQ2JyJTNFJTNDYnIlM0UKJTA5JTA5JTA5JTA5JTA5JTI2bmJzcCUzQiUyNm5ic3AlM0ItJTIwJUU1JUE2JTgyJUU5JTlDJTgwJUU2JThDJTg3JUU1JUFFJTlBJUU4JThBJTgyJUU3JTgyJUI5JUU1JUE0JTg3JUU2JUIzJUE4JUU1JThGJUFGJUU1JUIwJTg2JTIyJTNGaWQlM0RDRiVFNCVCQyU5OCVFOSU4MCU4OSUyMiVFNSU4RiU4MiVFNiU5NSVCMCVFNiVCNyVCQiVFNSU4QSVBMCVFNSU4OCVCMCVFOSU5MyVCRSVFNiU4RSVBNSVFNiU5QyVBQiVFNSVCMCVCRSVFRiVCQyU4QyVFNCVCRSU4QiVFNSVBNiU4MiVFRiVCQyU5QSUzQ2JyJTNFCiUwOSUwOSUwOSUwOSUwOSUyNm5ic3AlM0IlMjZuYnNwJTNCaHR0cHMlM0ElMkYlMkZyYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tJTJGY21saXUlMkZXb3JrZXJWbGVzczJzdWIlMkZtYWluJTJGQ2xvdWRmbGFyZVNwZWVkVGVzdC5jc3YlM0NzdHJvbmclM0UlM0ZpZCUzRENGJUU0JUJDJTk4JUU5JTgwJTg5JTNDJTJGc3Ryb25nJTNFJTNDYnIlM0UlM0NiciUzRQolMDklMDklMDklMDklMDklMjZuYnNwJTNCJTI2bmJzcCUzQi0lMjAlRTUlQTYlODIlRTklOUMlODAlRTYlOEMlODclRTUlQUUlOUElRTUlQTQlOUElRTQlQjglQUElRTUlOEYlODIlRTYlOTUlQjAlRTUlODglOTklRTklOUMlODAlRTglQTYlODElRTQlQkQlQkYlRTclOTQlQTglMjclMjYlMjclRTUlODElOUElRTklOTclQjQlRTklOUElOTQlRUYlQkMlOEMlRTQlQkUlOEIlRTUlQTYlODIlRUYlQkMlOUElM0NiciUzRQolMDklMDklMDklMDklMDklMjZuYnNwJTNCJTI2bmJzcCUzQmh0dHBzJTNBJTJGJTJGcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSUyRmNtbGl1JTJGV29ya2VyVmxlc3Myc3ViJTJGbWFpbiUyRkNsb3VkZmxhcmVTcGVlZFRlc3QuY3N2JTNGaWQlM0RDRiVFNCVCQyU5OCVFOSU4MCU4OSUzQ3N0cm9uZyUzRSUyNiUzQyUyRnN0cm9uZyUzRXBvcnQlM0QyMDUzJTNDYnIlM0U='))}
                </div>
                <div class="editor-container">
                    ${hasKV ? `
                    <textarea class="editor" 
                        placeholder="${decodeURIComponent(atob('QUREJUU3JUE0JUJBJUU0JUJFJThCJUVGJUJDJTlBCnZpc2EuY24lMjMlRTQlQkMlOTglRTklODAlODklRTUlOUYlOUYlRTUlOTAlOEQKMTI3LjAuMC4xJTNBMTIzNCUyM0NGbmF0CiU1QjI2MDYlM0E0NzAwJTNBJTNBJTVEJTNBMjA1MyUyM0lQdjYKCiVFNiVCMyVBOCVFNiU4NCU4RiVFRiVCQyU5QQolRTYlQUYlOEYlRTglQTElOEMlRTQlQjglODAlRTQlQjglQUElRTUlOUMlQjAlRTUlOUQlODAlRUYlQkMlOEMlRTYlQTAlQkMlRTUlQkMlOEYlRTQlQjglQkElMjAlRTUlOUMlQjAlRTUlOUQlODAlM0ElRTclQUIlQUYlRTUlOEYlQTMlMjMlRTUlQTQlODclRTYlQjMlQTgKSVB2NiVFNSU5QyVCMCVFNSU5RCU4MCVFOSU5QyU4MCVFOCVBNiU4MSVFNyU5NCVBOCVFNCVCOCVBRCVFNiU4QiVBQyVFNSU4RiVCNyVFNiU4QiVBQyVFOCVCNSVCNyVFNiU5RCVBNSVFRiVCQyU4QyVFNSVBNiU4MiVFRiVCQyU5QSU1QjI2MDYlM0E0NzAwJTNBJTNBJTVEJTNBMjA1MwolRTclQUIlQUYlRTUlOEYlQTMlRTQlQjglOEQlRTUlODYlOTklRUYlQkMlOEMlRTklQkIlOTglRTglQUUlQTQlRTQlQjglQkElMjA0NDMlMjAlRTclQUIlQUYlRTUlOEYlQTMlRUYlQkMlOEMlRTUlQTYlODIlRUYlQkMlOUF2aXNhLmNuJTIzJUU0JUJDJTk4JUU5JTgwJTg5JUU1JTlGJTlGJUU1JTkwJThECgoKQUREQVBJJUU3JUE0JUJBJUU0JUJFJThCJUVGJUJDJTlBCmh0dHBzJTNBJTJGJTJGcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSUyRmNtbGl1JTJGV29ya2VyVmxlc3Myc3ViJTJGcmVmcyUyRmhlYWRzJTJGbWFpbiUyRmFkZHJlc3Nlc2FwaS50eHQKCiVFNiVCMyVBOCVFNiU4NCU4RiVFRiVCQyU5QUFEREFQSSVFNyU5QiVCNCVFNiU4RSVBNSVFNiVCNyVCQiVFNSU4QSVBMCVFNyU5QiVCNCVFOSU5MyVCRSVFNSU4RCVCMyVFNSU4RiVBRg=='))}"
                        id="content">${content}</textarea>
                    <div class="save-container">
                        <button class="back-btn" onclick="goBack()">返回配置页</button>
                        <button class="bestip-btn" onclick="goBestIP()">在线优选IP</button>
                        <button class="save-btn" onclick="saveContent(this)">保存</button>
                        <span class="save-status" id="saveStatus"></span>
                    </div>
                    <br>
                    ################################################################<br>
                    ${cmad}
                    ` : '<p>未绑定KV空间</p>'}
                </div>
        
                <script>
                if (document.querySelector('.editor')) {
                    let timer;
                    const textarea = document.getElementById('content');
                    const originalContent = textarea.value;
        
                    function goBack() {
                        const currentUrl = window.location.href;
                        const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
                        window.location.href = parentUrl;
                    }
        
                    function goBestIP() {
                        const currentUrl = window.location.href;
                        const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
                        window.location.href = parentUrl + '/bestip';
                    }
        
                    function replaceFullwidthColon() {
                        const text = textarea.value;
                        textarea.value = text.replace(/：/g, ':');
                    }
                    
                    function saveContent(button) {
                        try {
                            const updateButtonText = (step) => {
                                button.textContent = \`保存中: \${step}\`;
                            };
                            // 检测是否为iOS设备
                            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                            
                            // 仅在非iOS设备上执行replaceFullwidthColon
                            if (!isIOS) {
                                replaceFullwidthColon();
                            }
                            updateButtonText('开始保存');
                            button.disabled = true;
                            // 获取textarea内容和原始内容
                            const textarea = document.getElementById('content');
                            if (!textarea) {
                                throw new Error('找不到文本编辑区域');
                            }
                            updateButtonText('获取内容');
                            let newContent;
                            let originalContent;
                            try {
                                newContent = textarea.value || '';
                                originalContent = textarea.defaultValue || '';
                            } catch (e) {
                                console.error('获取内容错误:', e);
                                throw new Error('无法获取编辑内容');
                            }
                            updateButtonText('准备状态更新函数');
                            const updateStatus = (message, isError = false) => {
                                const statusElem = document.getElementById('saveStatus');
                                if (statusElem) {
                                    statusElem.textContent = message;
                                    statusElem.style.color = isError ? 'red' : '#666';
                                }
                            };
                            updateButtonText('准备按钮重置函数');
                            const resetButton = () => {
                                button.textContent = '保存';
                                button.disabled = false;
                            };
                            if (newContent !== originalContent) {
                                updateButtonText('发送保存请求');
                                fetch(window.location.href, {
                                    method: 'POST',
                                    body: newContent,
                                    headers: {
                                        'Content-Type': 'text/plain;charset=UTF-8'
                                    },
                                    cache: 'no-cache'
                                })
                                .then(response => {
                                    updateButtonText('检查响应状态');
                                    if (!response.ok) {
                                        throw new Error(\`HTTP error! status: \${response.status}\`);
                                    }
                                    updateButtonText('更新保存状态');
                                    const now = new Date().toLocaleString();
                                    document.title = \`编辑已保存 \${now}\`;
                                    updateStatus(\`已保存 \${now}\`);
                                })
                                .catch(error => {
                                    updateButtonText('处理错误');
                                    console.error('Save error:', error);
                                    updateStatus(\`保存失败: \${error.message}\`, true);
                                })
                                .finally(() => {
                                    resetButton();
                                });
                            } else {
                                updateButtonText('检查内容变化');
                                updateStatus('内容未变化');
                                resetButton();
                            }
                        } catch (error) {
                            console.error('保存过程出错:', error);
                            button.textContent = '保存';
                            button.disabled = false;
                            const statusElem = document.getElementById('saveStatus');
                            if (statusElem) {
                                statusElem.textContent = \`错误: \${error.message}\`;
                                statusElem.style.color = 'red';
                            }
                        }
                    }
        
                    textarea.addEventListener('blur', saveContent);
                    textarea.addEventListener('input', () => {
                        clearTimeout(timer);
                        timer = setTimeout(saveContent, 5000);
                    });
                }
        
                function toggleNotice() {
                    const noticeContent = document.getElementById('noticeContent');
                    const noticeToggle = document.getElementById('noticeToggle');
                    if (noticeContent.style.display === 'none' || noticeContent.style.display === '') {
                        noticeContent.style.display = 'block';
                        noticeToggle.textContent = '注意事项∧';
                    } else {
                        noticeContent.style.display = 'none';
                        noticeToggle.textContent = '注意事项∨';
                    }
                }
        
                // 初始化 noticeContent 的 display 属性
                document.addEventListener('DOMContentLoaded', () => {
                    document.getElementById('noticeContent').style.display = 'none';
                });
                </script>
            </body>
            </html>
        `;

        return new Response(html, {
            headers: { "Content-Type": "text/html;charset=utf-8" }
        });
    } catch (error) {
        console.error('处理请求时发生错误:', error);
        return new Response("服务器错误: " + error.message, {
            status: 500,
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
    }
}

async function resolveToIPv6(target) {
    // 检查是否为IPv4
    function isIPv4(str) {
        const parts = str.split('.');
        return parts.length === 4 && parts.every(part => {
            const num = parseInt(part, 10);
            return num >= 0 && num <= 255 && part === num.toString();
        });
    }

    // 检查是否为IPv6
    function isIPv6(str) {
        return str.includes(':') && /^[0-9a-fA-F:]+$/.test(str);
    }

    // 获取域名的IPv4地址
    async function fetchIPv4(domain) {
        const url = `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/dns-json' }
        });

        if (!response.ok) throw new Error('DNS查询失败');

        const data = await response.json();
        const ipv4s = (data.Answer || [])
            .filter(record => record.type === 1)
            .map(record => record.data);

        if (ipv4s.length === 0) throw new Error('未找到IPv4地址');
        return ipv4s[Math.floor(Math.random() * ipv4s.length)];
    }

    // 查询NAT64 IPv6地址
    async function queryNAT64(domain) {
        const socket = connect({
            hostname: isIPv6(DNS64Server) ? `[${DNS64Server}]` : DNS64Server,
            port: 53
        });

        const writer = socket.writable.getWriter();
        const reader = socket.readable.getReader();

        try {
            // 发送DNS查询
            const query = buildDNSQuery(domain);
            const queryWithLength = new Uint8Array(query.length + 2);
            queryWithLength[0] = query.length >> 8;
            queryWithLength[1] = query.length & 0xFF;
            queryWithLength.set(query, 2);
            await writer.write(queryWithLength);

            // 读取响应
            const response = await readDNSResponse(reader);
            const ipv6s = parseIPv6(response);

            return ipv6s.length > 0 ? ipv6s[0] : '未找到IPv6地址';
        } finally {
            await writer.close();
            await reader.cancel();
        }
    }

    // 构建DNS查询包
    function buildDNSQuery(domain) {
        const buffer = new ArrayBuffer(512);
        const view = new DataView(buffer);
        let offset = 0;

        // DNS头部
        view.setUint16(offset, Math.floor(Math.random() * 65536)); offset += 2; // ID
        view.setUint16(offset, 0x0100); offset += 2; // 标志
        view.setUint16(offset, 1); offset += 2; // 问题数
        view.setUint16(offset, 0); offset += 6; // 答案数/权威数/附加数

        // 域名编码
        for (const label of domain.split('.')) {
            view.setUint8(offset++, label.length);
            for (let i = 0; i < label.length; i++) {
                view.setUint8(offset++, label.charCodeAt(i));
            }
        }
        view.setUint8(offset++, 0); // 结束标记

        // 查询类型和类
        view.setUint16(offset, 28); offset += 2; // AAAA记录
        view.setUint16(offset, 1); offset += 2; // IN类

        return new Uint8Array(buffer, 0, offset);
    }

    // 读取DNS响应
    async function readDNSResponse(reader) {
        const chunks = [];
        let totalLength = 0;
        let expectedLength = null;

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            chunks.push(value);
            totalLength += value.length;

            if (expectedLength === null && totalLength >= 2) {
                expectedLength = (chunks[0][0] << 8) | chunks[0][1];
            }

            if (expectedLength !== null && totalLength >= expectedLength + 2) {
                break;
            }
        }

        // 合并数据并跳过长度前缀
        const fullResponse = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            fullResponse.set(chunk, offset);
            offset += chunk.length;
        }

        return fullResponse.slice(2);
    }

    // 解析IPv6地址
    function parseIPv6(response) {
        const view = new DataView(response.buffer);
        let offset = 12; // 跳过DNS头部

        // 跳过问题部分
        while (view.getUint8(offset) !== 0) {
            offset += view.getUint8(offset) + 1;
        }
        offset += 5;

        const answers = [];
        const answerCount = view.getUint16(6); // 答案数量

        for (let i = 0; i < answerCount; i++) {
            // 跳过名称
            if ((view.getUint8(offset) & 0xC0) === 0xC0) {
                offset += 2;
            } else {
                while (view.getUint8(offset) !== 0) {
                    offset += view.getUint8(offset) + 1;
                }
                offset++;
            }

            const type = view.getUint16(offset); offset += 2;
            offset += 6; // 跳过类和TTL
            const dataLength = view.getUint16(offset); offset += 2;

            if (type === 28 && dataLength === 16) { // AAAA记录
                const parts = [];
                for (let j = 0; j < 8; j++) {
                    parts.push(view.getUint16(offset + j * 2).toString(16));
                }
                answers.push(parts.join(':'));
            }
            offset += dataLength;
        }

        return answers;
    }

    function convertToNAT64IPv6(ipv4Address) {
        const parts = ipv4Address.split('.');
        if (parts.length !== 4) {
            throw new Error('无效的IPv4地址');
        }

        // 将每个部分转换为16进制
        const hex = parts.map(part => {
            const num = parseInt(part, 10);
            if (num < 0 || num > 255) {
                throw new Error('无效的IPv4地址段');
            }
            return num.toString(16).padStart(2, '0');
        });

        // 构造NAT64
        return DNS64Server.split('/96')[0] + hex[0] + hex[1] + ":" + hex[2] + hex[3];
    }

    try {
        // 判断输入类型并处理
        if (isIPv6(target)) return target; // IPv6直接返回
        const ipv4 = isIPv4(target) ? target : await fetchIPv4(target);
        const nat64 = DNS64Server.endsWith('/96') ? convertToNAT64IPv6(ipv4) : await queryNAT64(ipv4 + atob('LmlwLjA5MDIyNy54eXo='));
        return isIPv6(nat64) ? nat64 : atob('cHJveHlpcC5jbWxpdXNzc3MubmV0');
    } catch (error) {
        console.error('解析错误:', error);
        return atob('cHJveHlpcC5jbWxpdXNzc3MubmV0');;
    }
}

async function bestIP(request, env, txt = 'ADD.txt') {
    const country = request.cf?.country || 'CN';
    const url = new URL(request.url);

    async function GetCFIPs(ipSource = 'official', targetPort = '443') {
        try {
            let response;
            if (ipSource === 'as13335') {
                // AS13335列表
                response = await fetch('https://raw.githubusercontent.com/ipverse/asn-ip/master/as/13335/ipv4-aggregated.txt');
            } else if (ipSource === 'as209242') {
                // AS209242列表
                response = await fetch('https://raw.githubusercontent.com/ipverse/asn-ip/master/as/209242/ipv4-aggregated.txt');
            } else if (ipSource === 'as24429') {
                // AS24429列表
                response = await fetch('https://raw.githubusercontent.com/ipverse/asn-ip/master/as/24429/ipv4-aggregated.txt');
            } else if (ipSource === 'as199524') {
                // AS199524列表
                response = await fetch('https://raw.githubusercontent.com/ipverse/asn-ip/master/as/199524/ipv4-aggregated.txt');
            } else if (ipSource === 'cm') {
                // CM整理列表
                response = await fetch('https://raw.githubusercontent.com/cmliu/cmliu/main/CF-CIDR.txt');
            } else if (ipSource === 'proxyip') {
                // 反代IP列表 (直接IP，非CIDR)
                response = await fetch('https://raw.githubusercontent.com/cmliu/ACL4SSR/main/baipiao.txt');
                const text = response.ok ? await response.text() : '';

                // 解析并过滤符合端口的IP
                const allLines = text.split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('#'));

                const validIps = [];

                for (const line of allLines) {
                    const parsedIP = parseProxyIPLine(line, targetPort);
                    if (parsedIP) {
                        validIps.push(parsedIP);
                    }
                }

                console.log(`反代IP列表解析完成，端口${targetPort}匹配到${validIps.length}个有效IP`);

                // 如果超过1000个IP，随机选择1000个
                if (validIps.length > 1000) {
                    const shuffled = [...validIps].sort(() => 0.5 - Math.random());
                    const selectedIps = shuffled.slice(0, 1000);
                    console.log(`IP数量超过1000个，随机选择了${selectedIps.length}个IP`);
                    return selectedIps;
                } else {
                    return validIps;
                }
            } else {
                // CF官方列表 (默认)
                response = await fetch('https://www.cloudflare.com/ips-v4/');
            }

            const text = response.ok ? await response.text() : `173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22`;
            const cidrs = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));

            const ips = new Set(); // 使用Set去重
            const targetCount = 1000;
            let round = 1;

            // 不断轮次生成IP直到达到目标数量
            while (ips.size < targetCount) {
                console.log(`第${round}轮生成IP，当前已有${ips.size}个`);

                // 每轮为每个CIDR生成指定数量的IP
                for (const cidr of cidrs) {
                    if (ips.size >= targetCount) break;

                    const cidrIPs = generateIPsFromCIDR(cidr.trim(), round);
                    cidrIPs.forEach(ip => ips.add(ip));

                    console.log(`CIDR ${cidr} 第${round}轮生成${cidrIPs.length}个IP，总计${ips.size}个`);
                }

                round++;

                // 防止无限循环
                if (round > 100) {
                    console.warn('达到最大轮次限制，停止生成');
                    break;
                }
            }

            console.log(`最终生成${ips.size}个不重复IP`);
            return Array.from(ips).slice(0, targetCount);
        } catch (error) {
            console.error('获取CF IPs失败:', error);
            return [];
        }
    }

    // 新增：解析反代IP行的函数
    function parseProxyIPLine(line, targetPort) {
        try {
            // 移除首尾空格
            line = line.trim();
            if (!line) return null;

            let ip = '';
            let port = '';
            let comment = '';

            // 处理注释部分
            if (line.includes('#')) {
                const parts = line.split('#');
                const mainPart = parts[0].trim();
                comment = parts[1].trim();

                // 检查主要部分是否包含端口
                if (mainPart.includes(':')) {
                    const ipPortParts = mainPart.split(':');
                    if (ipPortParts.length === 2) {
                        ip = ipPortParts[0].trim();
                        port = ipPortParts[1].trim();
                    } else {
                        // 格式不正确，如":844347.254.171.15:8443"
                        console.warn(`无效的IP:端口格式: ${line}`);
                        return null;
                    }
                } else {
                    // 没有端口，默认443
                    ip = mainPart;
                    port = '443';
                }
            } else {
                // 没有注释
                if (line.includes(':')) {
                    const ipPortParts = line.split(':');
                    if (ipPortParts.length === 2) {
                        ip = ipPortParts[0].trim();
                        port = ipPortParts[1].trim();
                    } else {
                        // 格式不正确
                        console.warn(`无效的IP:端口格式: ${line}`);
                        return null;
                    }
                } else {
                    // 只有IP，默认443端口
                    ip = line;
                    port = '443';
                }
            }

            // 验证IP格式
            if (!isValidIP(ip)) {
                console.warn(`无效的IP地址: ${ip} (来源行: ${line})`);
                return null;
            }

            // 验证端口格式
            const portNum = parseInt(port);
            if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                console.warn(`无效的端口号: ${port} (来源行: ${line})`);
                return null;
            }

            // 检查端口是否匹配
            if (port !== targetPort) {
                return null; // 端口不匹配，过滤掉
            }

            // 构建返回格式
            if (comment) {
                return `${ip}:${port}#${comment}`;
            } else {
                return `${ip}:${port}`;
            }

        } catch (error) {
            console.error(`解析IP行失败: ${line}`, error);
            return null;
        }
    }

    // 新增：验证IP地址格式的函数
    function isValidIP(ip) {
        const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        const match = ip.match(ipRegex);

        if (!match) return false;

        // 检查每个数字是否在0-255范围内
        for (let i = 1; i <= 4; i++) {
            const num = parseInt(match[i]);
            if (num < 0 || num > 255) {
                return false;
            }
        }

        return true;
    }

    function generateIPsFromCIDR(cidr, count = 1) {
        const [network, prefixLength] = cidr.split('/');
        const prefix = parseInt(prefixLength);

        // 将IP地址转换为32位整数
        const ipToInt = (ip) => {
            return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
        };

        // 将32位整数转换为IP地址
        const intToIP = (int) => {
            return [
                (int >>> 24) & 255,
                (int >>> 16) & 255,
                (int >>> 8) & 255,
                int & 255
            ].join('.');
        };

        const networkInt = ipToInt(network);
        const hostBits = 32 - prefix;
        const numHosts = Math.pow(2, hostBits);

        // 限制生成数量不超过该CIDR的可用主机数
        const maxHosts = numHosts - 2; // -2 排除网络地址和广播地址
        const actualCount = Math.min(count, maxHosts);
        const ips = new Set();

        // 如果可用主机数太少，直接返回空数组
        if (maxHosts <= 0) {
            return [];
        }

        // 生成指定数量的随机IP
        let attempts = 0;
        const maxAttempts = actualCount * 10; // 防止无限循环

        while (ips.size < actualCount && attempts < maxAttempts) {
            const randomOffset = Math.floor(Math.random() * maxHosts) + 1; // +1 避免网络地址
            const randomIP = intToIP(networkInt + randomOffset);
            ips.add(randomIP);
            attempts++;
        }

        return Array.from(ips);
    }

    // POST请求处理
    if (request.method === "POST") {
        if (!env.KV) return new Response("未绑定KV空间", { status: 400 });

        try {
            const contentType = request.headers.get('Content-Type');

            // 处理JSON格式的保存/追加请求
            if (contentType && contentType.includes('application/json')) {
                const data = await request.json();
                const action = url.searchParams.get('action') || 'save';

                if (!data.ips || !Array.isArray(data.ips)) {
                    return new Response(JSON.stringify({ error: 'Invalid IP list' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                if (action === 'append') {
                    // 追加模式
                    const existingContent = await env.KV.get(txt) || '';
                    const newContent = data.ips.join('\n');

                    // 合并内容并去重
                    const existingLines = existingContent ?
                        existingContent.split('\n').map(line => line.trim()).filter(line => line) :
                        [];
                    const newLines = newContent.split('\n').map(line => line.trim()).filter(line => line);

                    // 使用Set进行去重
                    const allLines = [...existingLines, ...newLines];
                    const uniqueLines = [...new Set(allLines)];
                    const combinedContent = uniqueLines.join('\n');

                    // 检查合并后的内容大小
                    if (combinedContent.length > 24 * 1024 * 1024) {
                        return new Response(JSON.stringify({
                            error: `追加失败：合并后内容过大（${(combinedContent.length / 1024 / 1024).toFixed(2)}MB），超过KV存储限制（24MB）`
                        }), {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }

                    await env.KV.put(txt, combinedContent);

                    const addedCount = uniqueLines.length - existingLines.length;
                    const duplicateCount = newLines.length - addedCount;

                    let message = `成功追加 ${addedCount} 个新的优选IP（原有 ${existingLines.length} 个，现共 ${uniqueLines.length} 个）`;
                    if (duplicateCount > 0) {
                        message += `，已去重 ${duplicateCount} 个重复项`;
                    }

                    return new Response(JSON.stringify({
                        success: true,
                        message: message
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else {
                    // 保存模式（覆盖）
                    const content = data.ips.join('\n');

                    // 检查内容大小
                    if (content.length > 24 * 1024 * 1024) {
                        return new Response(JSON.stringify({
                            error: '内容过大，超过KV存储限制（24MB）'
                        }), {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }

                    await env.KV.put(txt, content);

                    return new Response(JSON.stringify({
                        success: true,
                        message: `成功保存 ${data.ips.length} 个优选IP`
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } else {
                // 处理普通文本格式的保存请求（兼容原有功能）
                const content = await request.text();
                await env.KV.put(txt, content);
                return new Response("保存成功");
            }

        } catch (error) {
            console.error('处理POST请求时发生错误:', error);
            return new Response(JSON.stringify({
                error: '操作失败: ' + error.message
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // GET请求部分
    let content = '';
    let hasKV = !!env.KV;

    if (hasKV) {
        try {
            content = await env.KV.get(txt) || '';
        } catch (error) {
            console.error('读取KV时发生错误:', error);
            content = '读取数据时发生错误: ' + error.message;
        }
    }

    // 移除初始IP加载，改为在前端动态加载
    const cfIPs = []; // 初始为空数组

    // 判断是否为中国用户
    const isChina = country === 'CN';
    const countryDisplayClass = isChina ? '' : 'proxy-warning';
    const countryDisplayText = isChina ? `${country}` : `${country} ⚠️`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <title>Cloudflare IP优选</title>
    <style>
        body {
            width: 80%;
            margin: 0 auto;
            font-family: Tahoma, Verdana, Arial, sans-serif;
            padding: 20px;
        }
        .ip-list {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            max-height: 400px;
            overflow-y: auto;
        }
        .ip-item {
            margin: 2px 0;
            font-family: monospace;
        }
        .stats {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .test-info {
            margin-top: 15px;
            padding: 12px;
            background-color: #f3e5f5;
            border: 1px solid #ce93d8;
            border-radius: 6px;
            color: #4a148c;
        }
        .test-info p {
            margin: 0;
            font-size: 14px;
            line-height: 1.5;
        }
        .proxy-warning {
            color: #d32f2f !important;
            font-weight: bold !important;
            font-size: 1.1em;
        }
        .warning-notice {
            background-color: #ffebee;
            border: 2px solid #f44336;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            color: #c62828;
        }
        .warning-notice h3 {
            margin: 0 0 10px 0;
            color: #d32f2f;
            font-size: 1.2em;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .warning-notice p {
            margin: 8px 0;
            line-height: 1.5;
        }
        .warning-notice ul {
            margin: 10px 0 10px 20px;
            line-height: 1.6;
        }
        .test-controls {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        .port-selector {
            margin: 10px 0;
        }
        .port-selector label {
            font-weight: bold;
            margin-right: 10px;
        }
        .port-selector select {
            padding: 5px 10px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        .button-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 15px;
        }
        .test-button {
            background-color: #4CAF50;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        .test-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .save-button {
            background-color: #2196F3;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        .save-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .save-button:not(:disabled):hover {
            background-color: #1976D2;
        }
        .append-button {
            background-color: #FF9800;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        .append-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .append-button:not(:disabled):hover {
            background-color: #F57C00;
        }
        .edit-button {
            background-color: #9C27B0;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        .edit-button:hover {
            background-color: #7B1FA2;
        }
        .back-button {
            background-color: #607D8B;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        .back-button:hover {
            background-color: #455A64;
        }
        .save-warning {
            margin-top: 10px;
            background-color: #fff3e0;
            border: 2px solid #ff9800;
            border-radius: 6px;
            padding: 12px;
            color: #e65100;
            font-weight: bold;
        }
        .save-warning small {
            font-size: 14px;
            line-height: 1.5;
            display: block;
        }
        .message {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            display: none;
        }
        .message.success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .message.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .progress {
            width: 100%;
            background-color: #f0f0f0;
            border-radius: 5px;
            margin: 10px 0;
        }
        .progress-bar {
            width: 0%;
            height: 20px;
            background-color: #4CAF50;
            border-radius: 5px;
            transition: width 0.3s;
        }
        .good-latency { color: #4CAF50; font-weight: bold; }
        .medium-latency { color: #FF9800; font-weight: bold; }
        .bad-latency { color: #f44336; font-weight: bold; }
        .show-more-section {
            text-align: center;
            margin: 10px 0;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 5px;
        }
        .show-more-btn {
            background-color: #607D8B;
            color: white;
            padding: 8px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
        }
        .show-more-btn:hover {
            background-color: #455A64;
        }
        .ip-display-info {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        .save-tip {
            margin-top: 15px;
            padding: 12px;
            background-color: #e8f5e8;
            border: 1px solid #4CAF50;
            border-radius: 6px;
            color: #2e7d32;
            font-size: 14px;
            line-height: 1.5;
        }
        .save-tip strong {
            color: #1b5e20;
        }
        .warm-tips {
            margin: 20px 0;
            padding: 15px;
            background-color: #fff3e0;
            border: 2px solid #ff9800;
            border-radius: 8px;
            color: #e65100;
        }
        .warm-tips h3 {
            margin: 0 0 10px 0;
            color: #f57c00;
            font-size: 1.1em;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .warm-tips p {
            margin: 8px 0;
            line-height: 1.6;
            font-size: 14px;
        }
        .warm-tips ul {
            margin: 10px 0 10px 20px;
            line-height: 1.6;
        }
        .warm-tips li {
            margin: 5px 0;
            font-size: 14px;
        }
        .warm-tips strong {
            color: #e65100;
            font-weight: bold;
        }
    </style>
    </head>
    <body>
    <h1>在线优选IP</h1>
    
    ${!isChina ? `
    <div class="warning-notice">
        <h3>🚨 代理检测警告</h3>
        <p><strong>检测到您当前很可能处于代理/VPN环境中！</strong></p>
        <p>在代理状态下进行的IP优选测试结果将不准确，可能导致：</p>
        <ul>
            <li>延迟数据失真，无法反映真实网络状况</li>
            <li>优选出的IP在直连环境下表现不佳</li>
            <li>测试结果对实际使用场景参考价值有限</li>
        </ul>
        <p><strong>建议操作：</strong>请关闭所有代理软件（VPN、科学上网工具等），确保处于直连网络环境后重新访问本页面。</p>
    </div>
    ` : ''}

    <div class="stats">
        <h2>统计信息</h2>
        <p><strong>您的国家：</strong><span class="${countryDisplayClass}">${countryDisplayText}</span></p>
        <p><strong>获取到的IP总数：</strong><span id="ip-count">点击开始测试后加载</span></p>
        <p><strong>测试进度：</strong><span id="progress-text">未开始</span></p>
        <div class="progress">
            <div class="progress-bar" id="progress-bar"></div>
        </div>
        <div class="test-info">
            <p><strong>📊 测试说明：</strong>当前优选方式仅进行网络延迟测试，主要评估连接响应速度，并未包含带宽速度测试。延迟测试可快速筛选出响应最快的IP节点，适合日常使用场景的初步优选。</p>
        </div>
    </div>
    
    <div class="warm-tips" id="warm-tips">
        <h3>💡 温馨提示</h3>
        <p><strong>优选完成但测试"真连接延迟"为 -1？</strong>这很有可能是您的网络运营商对你的请求进行了阻断。</p>
        <p><strong>建议尝试以下解决方案：</strong></p>
        <ul>
            <li><strong>更换端口：</strong>尝试使用其他端口（如 2053、2083、2087、2096、8443）</li>
            <li><strong>更换IP库：</strong>切换到不同的IP来源（CM整理列表、AS13335、AS209242列表等，但如果你不明白AS24429和AS199524意味着什么，那就不要选。）</li>
            <li><strong>更换自定义域名：</strong>如果您使用的还是免费域名，那么您更应该尝试一下更换自定义域</li>
        </ul>
        <p>💡 <strong>小贴士：</strong>不同地区和网络环境对各端口的支持情况可能不同，多尝试几个端口组合通常能找到适合的IP。</p>
    </div>

    <div class="test-controls">
        <div class="port-selector">
            <label for="ip-source-select">IP库：</label>
            <select id="ip-source-select">
                <option value="official">CF官方列表</option>
                <option value="cm">CM整理列表</option>
                <option value="as13335">AS13335列表</option>
                <option value="as209242">AS209242列表</option>
                <option value="as24429">AS24429列表(Alibaba)</option>
                <option value="as199524">AS199524列表(G-Core)</option>
                <option value="proxyip">反代IP列表</option>
            </select>

            <label for="port-select" style="margin-left: 20px;">端口：</label>
            <select id="port-select">
                <option value="443">443</option>
                <option value="2053">2053</option>
                <option value="2083">2083</option>
                <option value="2087">2087</option>
                <option value="2096">2096</option>
                <option value="8443">8443</option>
            </select>
        </div>
        <div class="button-group">
            <button class="test-button" id="test-btn" onclick="startTest()">开始延迟测试</button>
            <button class="save-button" id="save-btn" onclick="saveIPs()" disabled>覆盖保存优选IP</button>
            <button class="append-button" id="append-btn" onclick="appendIPs()" disabled>追加保存优选IP</button>
            <button class="edit-button" id="edit-btn" onclick="goEdit()">编辑优选列表</button>
            <button class="back-button" id="back-btn" onclick="goBack()">返回配置页</button>
        </div>
        <div class="save-warning">
            <small>⚠️ 重要提醒："覆盖保存优选IP"会完全覆盖当前 addresses/ADD 优选内容，请慎重考虑！建议优先使用"追加保存优选IP"功能。</small>
        </div>
        <div class="save-tip">
            <strong>💡 保存提示：</strong>[<strong>覆盖保存优选IP</strong>] 和 [<strong>追加保存优选IP</strong>] 功能仅会保存延迟最低的<strong>前16个优选IP</strong>。如需添加更多IP或进行自定义编辑，请使用 [<strong>编辑优选列表</strong>] 功能。
        </div>
        <div id="message" class="message"></div>
    </div>
    
    <h2>IP列表 <span id="result-count"></span></h2>
    <div class="ip-display-info" id="ip-display-info"></div>
    <div class="ip-list" id="ip-list">
        <div class="ip-item">请选择端口和IP库，然后点击"开始延迟测试"加载IP列表</div>
    </div>
    <div class="show-more-section" id="show-more-section" style="display: none;">
        <button class="show-more-btn" id="show-more-btn" onclick="toggleShowMore()">显示更多</button>
    </div>
    
    <script>
        let originalIPs = []; // 改为动态加载
        let testResults = [];
        let displayedResults = []; // 新增：存储当前显示的结果
        let showingAll = false; // 新增：标记是否显示全部内容
        let currentDisplayType = 'loading'; // 新增：当前显示类型 'loading' | 'results'
        
        // 新增：本地存储管理
        const StorageKeys = {
            PORT: 'cf-ip-test-port',
            IP_SOURCE: 'cf-ip-test-source'
        };
        
        // 初始化页面设置
        function initializeSettings() {
            const portSelect = document.getElementById('port-select');
            const ipSourceSelect = document.getElementById('ip-source-select');
            
            // 从本地存储读取上次的选择
            const savedPort = localStorage.getItem(StorageKeys.PORT);
            const savedIPSource = localStorage.getItem(StorageKeys.IP_SOURCE);
            
            // 恢复端口选择
            if (savedPort && portSelect.querySelector(\`option[value="\${savedPort}"]\`)) {
                portSelect.value = savedPort;
            } else {
                portSelect.value = '8443'; // 默认值
            }
            
            // 恢复IP库选择
            if (savedIPSource && ipSourceSelect.querySelector(\`option[value="\${savedIPSource}"]\`)) {
                ipSourceSelect.value = savedIPSource;
            } else {
                ipSourceSelect.value = 'official'; // 默认值改为CF官方列表
            }
            
            // 添加事件监听器保存选择
            portSelect.addEventListener('change', function() {
                localStorage.setItem(StorageKeys.PORT, this.value);
            });
            
            ipSourceSelect.addEventListener('change', function() {
                localStorage.setItem(StorageKeys.IP_SOURCE, this.value);
            });
        }
        
        // 页面加载完成后初始化设置
        document.addEventListener('DOMContentLoaded', initializeSettings);
        
        // 新增：切换显示更多/更少
        function toggleShowMore() {
            // 在测试过程中不允许切换显示
            if (currentDisplayType === 'testing') {
                return;
            }
            
            showingAll = !showingAll;
            
            if (currentDisplayType === 'loading') {
                displayLoadedIPs();
            } else if (currentDisplayType === 'results') {
                displayResults();
            }
        }
        
        // 新增：显示加载的IP列表
        function displayLoadedIPs() {
            const ipList = document.getElementById('ip-list');
            const showMoreSection = document.getElementById('show-more-section');
            const showMoreBtn = document.getElementById('show-more-btn');
            const ipDisplayInfo = document.getElementById('ip-display-info');
            
            if (originalIPs.length === 0) {
                ipList.innerHTML = '<div class="ip-item">加载IP列表失败，请重试</div>';
                showMoreSection.style.display = 'none';
                ipDisplayInfo.textContent = '';
                return;
            }
            
            const displayCount = showingAll ? originalIPs.length : Math.min(originalIPs.length, 16);
            const displayIPs = originalIPs.slice(0, displayCount);
            
            // 更新显示信息
            if (originalIPs.length <= 16) {
                ipDisplayInfo.textContent = \`显示全部 \${originalIPs.length} 个IP\`;
                showMoreSection.style.display = 'none';
            } else {
                ipDisplayInfo.textContent = \`显示前 \${displayCount} 个IP，共加载 \${originalIPs.length} 个IP\`;
                // 只在非测试状态下显示"显示更多"按钮
                if (currentDisplayType !== 'testing') {
                    showMoreSection.style.display = 'block';
                    showMoreBtn.textContent = showingAll ? '显示更少' : '显示更多';
                    showMoreBtn.disabled = false;
                } else {
                    showMoreSection.style.display = 'none';
                }
            }
            
            // 显示IP列表
            ipList.innerHTML = displayIPs.map(ip => \`<div class="ip-item">\${ip}</div>\`).join('');
        }
        
        function showMessage(text, type = 'success') {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = text;
            messageDiv.className = \`message \${type}\`;
            messageDiv.style.display = 'block';
            
            // 3秒后自动隐藏消息
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
        
        function updateButtonStates() {
            const saveBtn = document.getElementById('save-btn');
            const appendBtn = document.getElementById('append-btn');
            const hasResults = displayedResults.length > 0;
            
            saveBtn.disabled = !hasResults;
            appendBtn.disabled = !hasResults;
        }
        
        function disableAllButtons() {
            const testBtn = document.getElementById('test-btn');
            const saveBtn = document.getElementById('save-btn');
            const appendBtn = document.getElementById('append-btn');
            const editBtn = document.getElementById('edit-btn');
            const backBtn = document.getElementById('back-btn');
            const portSelect = document.getElementById('port-select');
            const ipSourceSelect = document.getElementById('ip-source-select');
            
            testBtn.disabled = true;
            saveBtn.disabled = true;
            appendBtn.disabled = true;
            editBtn.disabled = true;
            backBtn.disabled = true;
            portSelect.disabled = true;
            ipSourceSelect.disabled = true;
        }
        
        function enableButtons() {
            const testBtn = document.getElementById('test-btn');
            const editBtn = document.getElementById('edit-btn');
            const backBtn = document.getElementById('back-btn');
            const portSelect = document.getElementById('port-select');
            const ipSourceSelect = document.getElementById('ip-source-select');
            
            testBtn.disabled = false;
            editBtn.disabled = false;
            backBtn.disabled = false;
            portSelect.disabled = false;
            ipSourceSelect.disabled = false;
            updateButtonStates();
        }
        
        async function saveIPs() {
            if (displayedResults.length === 0) {
                showMessage('没有可保存的IP结果', 'error');
                return;
            }
            
            const saveBtn = document.getElementById('save-btn');
            const originalText = saveBtn.textContent;
            
            // 禁用所有按钮
            disableAllButtons();
            saveBtn.textContent = '保存中...';
            
            try {
                // 只保存前16个最优IP
                const saveCount = Math.min(displayedResults.length, 16);
                const ips = displayedResults.slice(0, saveCount).map(result => result.display);
                
                const response = await fetch('?action=save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ips })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage(\`\${data.message}（已保存前\${saveCount}个最优IP）\`, 'success');
                } else {
                    showMessage(data.error || '保存失败', 'error');
                }
                
            } catch (error) {
                showMessage('保存失败: ' + error.message, 'error');
            } finally {
                saveBtn.textContent = originalText;
                enableButtons();
            }
        }
        
        async function appendIPs() {
            if (displayedResults.length === 0) {
                showMessage('没有可追加的IP结果', 'error');
                return;
            }
            
            const appendBtn = document.getElementById('append-btn');
            const originalText = appendBtn.textContent;
            
            // 禁用所有按钮
            disableAllButtons();
            appendBtn.textContent = '追加中...';
            
            try {
                // 只追加前16个最优IP
                const saveCount = Math.min(displayedResults.length, 16);
                const ips = displayedResults.slice(0, saveCount).map(result => result.display);
                
                const response = await fetch('?action=append', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ips })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage(\`\${data.message}（已追加前\${saveCount}个最优IP）\`, 'success');
                } else {
                    showMessage(data.error || '追加失败', 'error');
                }
                
            } catch (error) {
                showMessage('追加失败: ' + error.message, 'error');
            } finally {
                appendBtn.textContent = originalText;
                enableButtons();
            }
        }
        
        function goEdit() {
            const currentUrl = window.location.href;
            const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
            window.location.href = parentUrl + '/edit';
        }
        
        function goBack() {
            const currentUrl = window.location.href;
            const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
            window.location.href = parentUrl;
        }
        
        async function testIP(ip, port) {
            const timeout = 999;
            
            // 解析IP格式
            const parsedIP = parseIPFormat(ip, port);
            if (!parsedIP) {
                return null;
            }
            
            // 第一次测试
            const firstResult = await singleTest(parsedIP.host, parsedIP.port, timeout);
            if (!firstResult) {
                return null; // 第一次测试失败，直接返回
            }
            
            // 第一次测试成功，再进行第二次测试
            console.log(\`IP \${parsedIP.host}:\${parsedIP.port} 第一次测试成功: \${firstResult.latency}ms，进行第二次测试...\`);
            
            const results = [firstResult];
            
            // 进行第二次测试
            const secondResult = await singleTest(parsedIP.host, parsedIP.port, timeout);
            if (secondResult) {
                results.push(secondResult);
                console.log(\`IP \${parsedIP.host}:\${parsedIP.port} 第二次测试: \${secondResult.latency}ms\`);
            }
            
            // 取最低延迟
            const bestResult = results.reduce((best, current) => 
                current.latency < best.latency ? current : best
            );
            
            const displayLatency = Math.floor(bestResult.latency / 2);
            
            console.log(\`IP \${parsedIP.host}:\${parsedIP.port} 最终结果: \${displayLatency}ms (原始: \${bestResult.latency}ms, 共\${results.length}次有效测试)\`);
            
            // 生成显示格式
            const comment = parsedIP.comment || 'CF优选IP';
            const display = \`\${parsedIP.host}:\${parsedIP.port}#\${comment} \${displayLatency}ms\`;
            
            return {
                ip: parsedIP.host,
                port: parsedIP.port,
                latency: displayLatency,
                originalLatency: bestResult.latency,
                testCount: results.length,
                comment: comment,
                display: display
            };
        }
        
        // 新增：解析IP格式的函数
        function parseIPFormat(ipString, defaultPort) {
            try {
                let host, port, comment;
                
                // 先处理注释部分（#之后的内容）
                let mainPart = ipString;
                if (ipString.includes('#')) {
                    const parts = ipString.split('#');
                    mainPart = parts[0];
                    comment = parts[1];
                }
                
                // 处理端口部分
                if (mainPart.includes(':')) {
                    const parts = mainPart.split(':');
                    host = parts[0];
                    port = parseInt(parts[1]);
                } else {
                    host = mainPart;
                    port = parseInt(defaultPort);
                }
                
                // 验证IP格式
                if (!host || !port || isNaN(port)) {
                    return null;
                }
                
                return {
                    host: host.trim(),
                    port: port,
                    comment: comment ? comment.trim() : null
                };
            } catch (error) {
                console.error('解析IP格式失败:', ipString, error);
                return null;
            }
        }
        
        async function singleTest(ip, port, timeout) {
            const startTime = Date.now();
            
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                
                const response = await fetch(\`https://\${ip}:\${port}/cdn-cgi/trace\`, {
                    signal: controller.signal,
                    mode: 'cors'
                });
                
                clearTimeout(timeoutId);
                // 如果请求成功了，说明这个IP不是我们要的
                return null;
                
            } catch (error) {
                const latency = Date.now() - startTime;
                
                // 检查是否是真正的超时（接近设定的timeout时间）
                if (latency >= timeout - 50) {
                    return null;
                }
                
                // 检查是否是 Failed to fetch 错误（通常是SSL/证书错误）
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    return {
                        ip: ip,
                        port: port,
                        latency: latency
                    };
                }
                
                return null;
            }
        }
        
        async function testIPsWithConcurrency(ips, port, maxConcurrency = 32) {
            const results = [];
            const totalIPs = ips.length;
            let completedTests = 0;
            
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            
            // 创建工作队列
            let index = 0;
            
            async function worker() {
                while (index < ips.length) {
                    const currentIndex = index++;
                    const ip = ips[currentIndex];
                    
                    const result = await testIP(ip, port);
                    if (result) {
                        results.push(result);
                    }
                    
                    completedTests++;
                    
                    // 更新进度
                    const progress = (completedTests / totalIPs) * 100;
                    progressBar.style.width = progress + '%';
                    progressText.textContent = \`\${completedTests}/\${totalIPs} (\${progress.toFixed(1)}%) - 有效IP: \${results.length}\`;
                }
            }
            
            // 创建工作线程
            const workers = Array(Math.min(maxConcurrency, ips.length))
                .fill()
                .map(() => worker());
            
            await Promise.all(workers);
            
            return results;
        }
        
        async function startTest() {
            const testBtn = document.getElementById('test-btn');
            const portSelect = document.getElementById('port-select');
            const ipSourceSelect = document.getElementById('ip-source-select');
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            const ipList = document.getElementById('ip-list');
            const resultCount = document.getElementById('result-count');
            const ipCount = document.getElementById('ip-count');
            const ipDisplayInfo = document.getElementById('ip-display-info');
            const showMoreSection = document.getElementById('show-more-section');
            
            const selectedPort = portSelect.value;
            const selectedIPSource = ipSourceSelect.value;
            
            // 保存当前选择到本地存储
            localStorage.setItem(StorageKeys.PORT, selectedPort);
            localStorage.setItem(StorageKeys.IP_SOURCE, selectedIPSource);
            
            testBtn.disabled = true;
            testBtn.textContent = '加载IP列表...';
            portSelect.disabled = true;
            ipSourceSelect.disabled = true;
            testResults = [];
            displayedResults = []; // 重置显示结果
            showingAll = false; // 重置显示状态
            currentDisplayType = 'loading'; // 设置当前显示类型
            ipList.innerHTML = '<div class="ip-item">正在加载IP列表，请稍候...</div>';
            ipDisplayInfo.textContent = '';
            showMoreSection.style.display = 'none';
            updateButtonStates(); // 更新按钮状态
            
            // 重置进度条
            progressBar.style.width = '0%';
            
            // 根据IP库类型显示对应的加载信息
            let ipSourceName = '';
            switch(selectedIPSource) {
                case 'official':
                    ipSourceName = 'CF官方';
                    break;
                case 'cm':
                    ipSourceName = 'CM整理';
                    break;
                case 'as13335':
                    ipSourceName = 'CF全段';
                    break;
                case 'as209242':
                    ipSourceName = 'CF非官方';
                    break;
                case 'as24429':
                    ipSourceName = 'Alibaba';
                    break;
                case 'as199524':
                    ipSourceName = 'G-Core';
                    break;
                case 'proxyip':
                    ipSourceName = '反代IP';
                    break;
                default:
                    ipSourceName = '未知';
            }
            
            progressText.textContent = \`正在加载 \${ipSourceName} IP列表...\`;
            
            // 加载IP列表
            originalIPs = await loadIPs(selectedIPSource, selectedPort);

            if (originalIPs.length === 0) {
                ipList.innerHTML = '<div class="ip-item">加载IP列表失败，请重试</div>';
                ipCount.textContent = '0 个';
                testBtn.disabled = false;
                testBtn.textContent = '开始延迟测试';
                portSelect.disabled = false;
                ipSourceSelect.disabled = false;
                progressText.textContent = '加载失败';
                return;
            }
            
            // 更新IP数量显示
            ipCount.textContent = \`\${originalIPs.length} 个\`;
            
            // 显示加载的IP列表（默认显示前16个）
            displayLoadedIPs();
            
            // 开始测试
            testBtn.textContent = '测试中...';
            progressText.textContent = \`开始测试端口 \${selectedPort}...\`;
            currentDisplayType = 'testing'; // 切换到测试状态
            
            // 在测试开始时隐藏显示更多按钮
            showMoreSection.style.display = 'none';
            
            // 使用16个并发线程测试
            const results = await testIPsWithConcurrency(originalIPs, selectedPort, 16);
            
            // 按延迟排序
            testResults = results.sort((a, b) => a.latency - b.latency);
            
            // 显示结果
            currentDisplayType = 'results'; // 切换到结果显示状态
            showingAll = false; // 重置显示状态
            displayResults();
            
            testBtn.disabled = false;
            testBtn.textContent = '重新测试';
            portSelect.disabled = false;
            ipSourceSelect.disabled = false;
            progressText.textContent = \`完成 - 有效IP: \${testResults.length}/\${originalIPs.length} (端口: \${selectedPort}, IP库: \${ipSourceName})\`;
        }
        
        // 新增：加载IP列表的函数
        async function loadIPs(ipSource, port) {
            try {
                const response = await fetch(\`?loadIPs=\${ipSource}&port=\${port}\`, {
                    method: 'GET'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load IPs');
                }
                
                const data = await response.json();
                return data.ips || [];
            } catch (error) {
                console.error('加载IP列表失败:', error);
                return [];
            }
        }
        
        function displayResults() {
            const ipList = document.getElementById('ip-list');
            const resultCount = document.getElementById('result-count');
            const showMoreSection = document.getElementById('show-more-section');
            const showMoreBtn = document.getElementById('show-more-btn');
            const ipDisplayInfo = document.getElementById('ip-display-info');
            
            if (testResults.length === 0) {
                ipList.innerHTML = '<div class="ip-item">未找到有效的IP</div>';
                resultCount.textContent = '';
                ipDisplayInfo.textContent = '';
                showMoreSection.style.display = 'none';
                displayedResults = [];
                updateButtonStates();
                return;
            }
            
            // 确定显示数量
            const maxDisplayCount = showingAll ? testResults.length : Math.min(testResults.length, 16);
            displayedResults = testResults.slice(0, maxDisplayCount);
            
            // 更新结果计数显示
            if (testResults.length <= 16) {
                resultCount.textContent = \`(共测试出 \${testResults.length} 个有效IP)\`;
                ipDisplayInfo.textContent = \`显示全部 \${testResults.length} 个测试结果\`;
                showMoreSection.style.display = 'none';
            } else {
                resultCount.textContent = \`(共测试出 \${testResults.length} 个有效IP)\`;
                ipDisplayInfo.textContent = \`显示前 \${maxDisplayCount} 个测试结果，共 \${testResults.length} 个有效IP\`;
                showMoreSection.style.display = 'block';
                showMoreBtn.textContent = showingAll ? '显示更少' : '显示更多';
                showMoreBtn.disabled = false; // 确保在结果显示时启用按钮
            }
            
            const resultsHTML = displayedResults.map(result => {
                let className = 'good-latency';
                if (result.latency > 200) className = 'bad-latency';
                else if (result.latency > 100) className = 'medium-latency';
                
                return \`<div class="ip-item \${className}">\${result.display}</div>\`;
            }).join('');
            
            ipList.innerHTML = resultsHTML;
            updateButtonStates();
        }
    </script>
    
    </body>
    </html>
    `;

    // 处理加载IP的请求
    if (url.searchParams.get('loadIPs')) {
        const ipSource = url.searchParams.get('loadIPs');
        const port = url.searchParams.get('port') || '443';
        const ips = await GetCFIPs(ipSource, port);

        return new Response(JSON.stringify({ ips }), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=UTF-8',
        },
    });
}