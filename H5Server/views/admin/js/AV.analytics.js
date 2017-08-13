/**
 * @author wangxiao
 * @date 2015-06-11
 * @homepage http://github.com/leancloud/js-analytics-sdk
 *
 * ÿλ����ʦ���б��ִ������ŵ�����
 * Each engineer has a duty to keep the code elegant
 */

void function(win) {

    // ��ǰ�汾
    var VERSION = '0.0.1';

    // ��ȡ�����ռ�
    var AV = win.AV || {};
    win.AV = AV;

    // AMD ����֧��
    if (typeof define === 'function' && define.amd) {
        define('AV', [], function() {
            return AV;
        });
    }

    // �����ռ䣬����һЩ���߷���
    var tool = {};

    // �����ռ䣬����˽�з���
    var engine = {};

    var newAnalytics = function(options) {
        var appId = options.appId;
        var appKey = options.appKey;

        // Ӧ�ð汾
        var appVersion = options.version || null;

        // �ƹ�����
        var appChannel = options.channel || null;

        return {

            // ����ͳ������
            send: function(options, callback) {
                var eventsList = [];

                // �ж��Ƿ��������ֵ������
                if (options && options.length) {
                    eventsList = options;
                }
                // ����������飬�Ǿ��Ƕ���
                else {
                    // �жϲ����Ƿ���ȷ
                    if (!options || !options.event) {
                        throw('EventObject must have a event value.');
                    }

                    // �����¼�����
                    var eventObj = {

                        // �¼�����
                        event: options.event,

                        // �¼����ԣ���ȫ�Զ���
                        attr: options.attr,

                        // ����ʱ��
                        duration: options.duration,

                        // �ڲ�ʹ��
                        tag: options.tag
                    };
                    eventsList.push(eventObj);
                }

                // ����������
                for (var i = 0, l = eventsList.length; i < l; i ++) {
                    eventsList[i].attributes = eventsList[i].attr;

                    // ����������ֶ�
                    delete eventsList[i].attr;
                }

                // ����ͳ�ƽӿ�
                var url = 'https://api.leancloud.cn/1.1/stats/open/collect';
                var data = {
                    client: {
                        id: engine.getId(),

                        // �������˻�ͳһ����Сд��ĸУ��
                        platform: 'web',
                        app_version: appVersion,
                        app_channel: appChannel
                    },
                    session: {
                        id: tool.getId()
                    },
                    events: eventsList
                };

                tool.ajax({
                    url: url,
                    method: 'post',
                    data: data,
                    appId: appId,
                    appKey: appKey
                }, function(result, error) {
                    if (callback) {
                        if (result) {
                            callback(result);
                        }
                        else {
                            callback(error);
                        }
                    }
                });
            }
        };
    };

    // ������
    AV.analytics = function(options) {
        if (typeof options !== 'object') {
            throw('AV.analytics need a argument at least.');
        }
        else if (!options.appId) {
            throw('Options must have appId.');
        }
        else if (!options.appKey) {
            throw('Options must have appKey.');
        }

        // ����һ���µ�ʵ��
        var analyticsObj = newAnalytics(options);

        // �����Զ�ҳ��ʱ��ͳ��
        engine.pageView(analyticsObj);

        // �����Զ� session ʱ��ͳ��
        engine.sessionView(analyticsObj);

        return analyticsObj;
    };

    // ��ֵ�汾��
    AV.analytics.version = VERSION;

    // ����˽�з���
    AV.analytics._tool = tool;
    AV.analytics._engine = engine;

    engine.getId = function() {
        var key = 'leancloud-analytics-id';
        var id = win.sessionStorage.getItem(key);
        if (!id) {
            id = tool.getId();
            win.sessionStorage.setItem(key, id);
        }
        return id;
    };

    // �Զ�ͳ��ҳ�����
    engine.pageView = function(analyticsObj) {
        var startTime;
        var endTime;
        var page;

        function start() {
            startTime = tool.now();
            page = win.location.href;
        }

        function end() {
            endTime = tool.now();
            analyticsObj.send({

                // ����Ϊ _page ��ʾһ��ҳ�����
                event: '_page',

                // ҳ��ͣ��ʱ�䣬��λ����
                duration: endTime - startTime,

                // ҳ������
                tag: page
            });
        }

        // Ĭ���Զ�����
        start();

        // ���� url �仯������ hash �仯��
        win.addEventListener('hashchange', function(e) {
            // ҳ�淢���仯������һ��ҳ��ͳ��
            end();
            // �ٴ������µ�ͳ��
            start();
        });

        // ��ҳ��رյ�ʱ��
        win.addEventListener('beforeunload', function() {
            // ����һ��
            end();
        });
    };

    // �Զ�ͳ��һ�� session ���ڵ�ʱ��
    engine.sessionView = function(analyticsObj) {
        var startTime = tool.now();
        win.addEventListener('beforeunload', function() {
            var endTime = tool.now();
            analyticsObj.send({

                //����Ϊ _session.close ��ʾһ��ʹ�ý���
                event: '_session.close',

                // ʹ��ʱ������λ����
                duration: endTime - startTime
            });
        });
    };

    // ��ȡһ��Ψһ id
    tool.getId = function() {

        // ��ʱ����ص��������
        var getIdItem = function() {
            return new Date().getTime().toString(36) + Math.random().toString(36).substring(2, 3);
        };
        return 'AV' + getIdItem() + getIdItem() + getIdItem();
    };

    // Ajax ����
    tool.ajax = function(options, callback) {
        var url = options.url;
        var method = options.method || 'get';
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        if (method === 'post' || method === 'put') {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }
        if (options.appId) {
            xhr.setRequestHeader('X-AVOSCloud-Application-Id', options.appId);
        }
        if (options.appKey) {
            xhr.setRequestHeader('X-AVOSCloud-Application-Key', options.appKey);
        }
        xhr.onload = function(data) {
            // �����Ϊ 2xx �ķ��ض��ǳɹ�
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(JSON.parse(xhr.responseText));
            }
            else {
                callback(null, JSON.parse(xhr.responseText));
            }
        };
        xhr.onerror = function(data) {
            callback(null, data);
            throw('Network error.');
        };
        xhr.send(JSON.stringify(options.data));
    };

    // ��ȡ��ǰʱ���ʱ���
    tool.now = function() {
        return new Date().getTime();
    };

} (window);