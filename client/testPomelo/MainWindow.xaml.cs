using Pomelo.DotNetClient;
using SimpleJson;
using System;
using System.Threading;
using System.Windows;

namespace testPomelo
{
    /// <summary>
    /// MainWindow.xaml 的交互逻辑
    /// </summary>
    public partial class MainWindow : Window
    {
        PomeloClient pc1;
        PomeloClient pc2;
        String host1;
        String host2;
        int port1;
        int port2;
        Thread t;
        Thread t2;
        public MainWindow()
        {
            InitializeComponent();
        }
        void OnQuery1(object sender, RoutedEventArgs e)
        {
            pc1 = new PomeloClient(this.ipAddr.Text, 3014);
            pc1.connect(null, delegate (JsonObject data) {
                JsonObject msg = new JsonObject();

                msg["userID"] = "demo1";
                pc1.request("gate.gateHandler.queryEntry", msg, delegate (JsonObject result) {
                    if (Convert.ToInt32(result["statusCode"]) == 900)
                    {
                        string host = (string)result["host"];
                        int port = Convert.ToInt32(result["port"]);
                        pc1.disconnect();
                        pc1.Dispose();
                        pc1 = null;
                        host1 = host;
                        port1 = port;
                        this.Dispatcher.BeginInvoke((Action)(() =>
                        {
                            this.Status11.Text = "success, " + host + ":" + port.ToString();
                        }));
                        Log1("query success, " + host + ":" + port.ToString());
                    }
                    else
                    {
                        this.Dispatcher.BeginInvoke((Action)(() =>
                        {
                            this.Status11.Text = "error, " + result["message"];
                        }));
                        Log1("error, " + result["message"]);
                    }
                });
            });
        }
        void OnQuery2(object sender, RoutedEventArgs e)
        {
            pc2 = new PomeloClient(this.ipAddr2.Text, 3014);
            pc2.connect(null, delegate (JsonObject data) {
                JsonObject msg = new JsonObject();
                msg["userID"] = "demo2";
                pc2.request("gate.gateHandler.queryEntry", msg, delegate (JsonObject result) {
                    if (Convert.ToInt32(result["statusCode"]) == 900)
                    {
                        string host = (string)result["host"];
                        int port = Convert.ToInt32(result["port"]);
                        pc2.disconnect();
                        pc2.Dispose();
                        pc2 = null;
                        host2 = host;
                        port2 = port;
                        this.Dispatcher.BeginInvoke((Action)(() =>
                        {
                            this.Status21.Text = "success, " + host + ":" + port.ToString();
                        }));
                        Log2("query success, " + host + ":" + port.ToString());
                    }
                    else
                    {
                        this.Dispatcher.BeginInvoke((Action)(() =>
                        {
                            this.Status21.Text = "error, " + result["message"];
                        }));
                        Log2("error, " + result["message"]);
                    }
                });
            });
        }
        void OnSwithIP(object sender, RoutedEventArgs e)
        {
            if (this.ipAddr.Text == "127.0.0.1")
            {
                this.ipAddr.Text = "123.57.16.157";
                //this.ipAddr.Text = "182.92.164.34";
            }
            else
            {
                this.ipAddr.Text = "127.0.0.1";
            }
        }
        void OnSwithIP2(object sender, RoutedEventArgs e)
        {
            if (this.ipAddr2.Text == "127.0.0.1")
            {
                this.ipAddr2.Text = "123.57.16.157";
                //this.ipAddr.Text = "182.92.164.34";
            }
            else
            {
                this.ipAddr2.Text = "127.0.0.1";
            }
        }
        void OnConnect1(object sender, RoutedEventArgs e) {
            pc1 = new PomeloClient(host1, port1);
            pc1.connect(null, delegate (JsonObject data) {
                this.Dispatcher.BeginInvoke((Action)(() =>
                {
                    this.Status12.Text = "success";
                }));
                Log1("connect success");
            });
            pc1.on("onChat", delegate (JsonObject msg) {
                Log1(msg.ToString());
            });
            pc1.on("onAdd", delegate (JsonObject msg) {
                Log1(msg.ToString());
            });
            pc1.on("onLeave", delegate (JsonObject msg) {
                Log1(msg.ToString());
            });
            pc1.on("disconnect", delegate (JsonObject msg) {
                Log1(msg.ToString());
            });
        }
        void OnConnect2(object sender, RoutedEventArgs e) {
            pc2 = new PomeloClient(host1, port1);
            pc2.connect(null, delegate (JsonObject data) {
                this.Dispatcher.BeginInvoke((Action)(() =>
                {
                    this.Status22.Text = "success";
                }));
                Log2("connect success");
            });
            pc2.on("onChat", delegate (JsonObject msg) {
                Log2(msg.ToString());
            });
            pc2.on("onAdd", delegate (JsonObject msg) {
                Log2(msg.ToString());
            });
            pc2.on("onLeave", delegate (JsonObject msg) {
                Log2(msg.ToString());
            });
            pc2.on("disconnect", delegate (JsonObject msg) {
                Log2(msg.ToString());
            });
        }
        void OnRequest1(object sender, RoutedEventArgs e) {
            if(pc1 == null)
            {
                Log1("not connected.");
                return;
            }
            if(this.Method1.Text == String.Empty)
            {
                Log1("method empty.");
                return;
            }
            if(this.Data1.Text == String.Empty)
            {
                Log1("data empty.");
                return;
            }
            dynamic de = SimpleJson.SimpleJson.DeserializeObject(this.Data1.Text);
            JsonObject msg = de as JsonObject;
            pc1.request(this.Method1.Text, msg, delegate (JsonObject data) {
                Log1(data.ToString());
            });
        }
        void OnNotify1(object sender, RoutedEventArgs e) {
            if (pc1 == null)
            {
                Log1("not connected.");
                return;
            }
            if (this.Method1.Text == String.Empty)
            {
                Log1("method empty.");
                return;
            }
            if (this.Data1.Text == String.Empty)
            {
                Log1("data empty.");
                return;
            }
            dynamic de = SimpleJson.SimpleJson.DeserializeObject(this.Data1.Text);
            JsonObject msg = de as JsonObject;
            pc1.notify(this.Method1.Text, msg);
        }
        void OnRequest2(object sender, RoutedEventArgs e) {
            if (pc2 == null)
            {
                Log2("not connected.");
                return;
            }
            if (this.Method2.Text == String.Empty)
            {
                Log2("method empty.");
                return;
            }
            if (this.Data2.Text == String.Empty)
            {
                Log2("data empty.");
                return;
            }
            dynamic de = SimpleJson.SimpleJson.DeserializeObject(this.Data1.Text);
            JsonObject msg = de as JsonObject;
            pc1.request(this.Method2.Text, msg, delegate (JsonObject data) {
                Log2(data.ToString());
            });
        }
        void OnNotify2(object sender, RoutedEventArgs e) {
            if (pc2 == null)
            {
                Log2("not connected.");
                return;
            }
            if (this.Method2.Text == String.Empty)
            {
                Log2("method empty.");
                return;
            }
            if (this.Data2.Text == String.Empty)
            {
                Log2("data empty.");
                return;
            }
            dynamic de = SimpleJson.SimpleJson.DeserializeObject(this.Data2.Text);
            JsonObject msg = de as JsonObject;
            pc2.notify(this.Method1.Text, msg);
        }
        void OnDispose1(object sender, RoutedEventArgs e) { }
        void OnDispose2(object sender, RoutedEventArgs e) { }
        void Log1(String str)
        {
            this.Dispatcher.BeginInvoke((Action)(() =>
            {
                this.msgRec1.Text += (str + "\r\n");
                this.msgRec1.ScrollToEnd();
            }));
        }
        void Log2(String str)
        {
            this.Dispatcher.BeginInvoke((Action)(() =>
            {
                this.msgRec2.Text += (str + "\r\n");
                this.msgRec2.ScrollToEnd();
            }));
        }
    }
}
