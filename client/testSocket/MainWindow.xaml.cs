using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using uPLibrary.Networking.M2Mqtt;
using uPLibrary.Networking.M2Mqtt.Messages;

namespace testSocket
{
    /// <summary>
    /// MainWindow.xaml 的交互逻辑
    /// </summary>
    public partial class MainWindow : Window
    {
        Socket s;
        Socket s2;

        MqttClient c;
        MqttClient c2;

        Thread t;
        Thread t2;

        const int port = 8060;
        public MainWindow()
        {
            InitializeComponent();
            this.sendContent.Text = "{\"action\":\"msg\",\"content\":{\"o_id\":\"54fc44196ca3b51bf0c384ec\",\"from\":\"54fe4fd1d632030368491c95\",\"to\":\"54fe4fe0d632030368491c97\",\"msg\":\"this is from uid 1.\",\"msgid\": \"" + randomStr() + "\"}}";
            this.sendContent2.Text = "{\"action\":\"msg\",\"content\":{\"o_id\":\"54fc44196ca3b51bf0c384ec\",\"from\":\"54fe4fe0d632030368491c97\",\"to\":\"54fe4fd1d632030368491c95\",\"msg\":\"this is from uid 2.\",\"msgid\": \"" + randomStr() + "\"}}";
            //this.sendContent3.Text = "{\"action\":\"msg\",\"content\":{\"o_id\":\"101\",\"from\":\"3\",\"to\":\"2\",\"msg\":\"this is from uid 1.\"}}";
            //this.sendContent4.Text = "{\"action\":\"msg\",\"content\":{\"o_id\":\"101\",\"from\":\"4\",\"to\":\"1\",\"msg\":\"this is from uid 2.\"}}";
            this.buildContent.Text = "{\"action\":\"build\",\"content\":{\"o_id\":\"54fc44196ca3b51bf0c384ec\",\"t_id\":\"54fe4fd1d632030368491c95\",\"s_id\":\"54fe4fe0d632030368491c97\"}}";
            this.buildContent2.Text = "{\"action\":\"build\",\"content\":{\"o_id\":\"54fc44196ca3b51bf0c384ec\",\"t_id\":\"54fe4fd1d632030368491c95\",\"s_id\":\"54fe4fe0d632030368491c97\",\"state\":\"1\"}}";
            this.orderContent.Text = "{\"action\":\"order\",\"content\":{\"o_id\":\"54fc44196ca3b51bf0c384ec\",\"status\":\"finished\",\"from\":\"54fe4fd1d632030368491c95\"}}";
            //{"action":"order","content":{"o_id":"54fc44196ca3b51bf0c384ec","status":"finished","from":"54fe4fe0d632030368491c97"}}
            this.orderContent2.Text = "{\"action\":\"order\",\"content\":{\"o_id\":\"54fc44196ca3b51bf0c384ec\",\"status\":\"finished\",\"from\":\"54fe4fe0d632030368491c97\"}}";
        }

        private void OnConnect(object seder, RoutedEventArgs e)
        {
            //connect
            try
            {
                s = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp); 
                IPAddress myIP = IPAddress.Parse(ipAddr.Text);
                s.Connect(myIP, port);
                s.Send(Encoding.UTF8.GetBytes("{\"action\":\"connect\",\"content\":{\"from\":\"" + this.UID.Text + "\"}}"));
                t = new Thread(new ThreadStart(ReadMSG));
                t.Start();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnConnect2(object seder, RoutedEventArgs e)
        {
            //connect
            try
            {
                s2 = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                IPAddress myIP = IPAddress.Parse(ipAddr2.Text);
                s2.Connect(myIP, port);
                s2.Send(Encoding.UTF8.GetBytes("{\"action\":\"connect\",\"content\":{\"from\":\"" + this.UID2.Text + "\"}}"));
                t2 = new Thread(new ThreadStart(ReadMSG2));
                t2.Start();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnSwithIP(object sender, RoutedEventArgs e)
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
        private void OnSwithIP2(object sender, RoutedEventArgs e)
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
        private void OnConnect3(object seder, RoutedEventArgs e)
        {
            //connect
            try
            {
                c = new MqttClient(ipAddr.Text, 8065, false, null);
                c.Connect(UID.Text, "alice", "secret", false, MqttMsgBase.QOS_LEVEL_AT_LEAST_ONCE, true, "byserver", "{\"action\":\"disconnect\",\"content\":{\"uid\":\"" + this.UID.Text + "\"}}", false, 90);
                //c.Subscribe(new string[] { "token001" }, new byte[] { MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE });
                c.Subscribe(new string[] { this.UID.Text }, new byte[] { MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE });
                c.ConnectionClosed += c_ConnectionClosed;
                c.MqttMsgPublished += c_MqttMsgPublished;
                c.MqttMsgPublishReceived += c_MqttMsgPublishReceived;
                c.MqttMsgSubscribed += c_MqttMsgSubscribed;
                c.MqttMsgUnsubscribed += c_MqttMsgUnsubscribed;

                byte[] byteToSend = Encoding.UTF8.GetBytes("{\"action\":\"connect\",\"content\":{\"uid\":\"" + this.UID.Text + "\",\"token\":\"token001\"}}");
                //c.Publish("byserver", byteToSend);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }

        void c_MqttMsgUnsubscribed(object sender, MqttMsgUnsubscribedEventArgs e)
        {
            //
        }

        void c_MqttMsgSubscribed(object sender, MqttMsgSubscribedEventArgs e)
        {
            //
            this.Dispatcher.BeginInvoke((Action)(() =>
            {
                this.msgRec.Text = "connected";
            }));
        }

        void c_MqttMsgPublishReceived(object sender, MqttMsgPublishEventArgs e)
        {
            //
            this.Dispatcher.BeginInvoke((Action)(() =>
            {
                this.msgRec.Text = Encoding.UTF8.GetString(e.Message);
            }));
        }

        void c_MqttMsgPublished(object sender, MqttMsgPublishedEventArgs e)
        {
            //
            this.Dispatcher.BeginInvoke((Action)(() =>
            {
                this.msgRec.Text = e.MessageId.ToString(); ;
            }));
        }

        void c_ConnectionClosed(object sender, EventArgs e)
        {
            this.Dispatcher.BeginInvoke((Action)(() =>
            {
                this.msgRec.Text = "connection closed.";
            }));
        }
        private void OnConnect4(object seder, RoutedEventArgs e)
        {
            //connect
            try
            {
                c2 = new MqttClient(ipAddr2.Text, 8065, false, null);
                c2.Connect(UID2.Text, "54f3b5fec08b6f54100c1cbf", "330bb4b14f4655100fcc853d9ba7b89c");
                c2.Subscribe(new string[] { "token002" }, new byte[] { MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE });
                c2.ConnectionClosed += c2_ConnectionClosed;
                c2.MqttMsgPublished += c2_MqttMsgPublished;
                c2.MqttMsgPublishReceived += c2_MqttMsgPublishReceived;
                c2.MqttMsgSubscribed += c2_MqttMsgSubscribed;
                c2.MqttMsgUnsubscribed += c2_MqttMsgUnsubscribed;
                byte[] byteToSend = Encoding.UTF8.GetBytes("{\"action\":\"connect\",\"content\":{\"uid\":\"" + this.UID2.Text + "\",\"token\":\"token002\"}}");
                c2.Publish("byserver", byteToSend);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }

        void c2_MqttMsgUnsubscribed(object sender, MqttMsgUnsubscribedEventArgs e)
        {
            //
        }

        void c2_MqttMsgSubscribed(object sender, MqttMsgSubscribedEventArgs e)
        {
            //
            this.Dispatcher.BeginInvoke((Action)(() =>
            {
                this.msgRec2.Text = "connected";
            }));
        }

        void c2_MqttMsgPublishReceived(object sender, MqttMsgPublishEventArgs e)
        {
            //
            this.Dispatcher.BeginInvoke((Action)(() =>
            {
                this.msgRec2.Text = Encoding.UTF8.GetString(e.Message);
            }));
        }

        void c2_MqttMsgPublished(object sender, MqttMsgPublishedEventArgs e)
        {
            //
            this.Dispatcher.BeginInvoke((Action)(() =>
            {
                this.msgRec2.Text = e.MessageId.ToString(); ;
            }));
        }

        void c2_ConnectionClosed(object sender, EventArgs e)
        {
            this.Dispatcher.BeginInvoke((Action)(() =>
            {
                this.msgRec2.Text = "connection closed.";
            }));
        }
        private void OnBuild(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(buildContent.Text);
                s.Send(byteToSend);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnBuild2(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(buildContent2.Text);
                s2.Send(byteToSend);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnBuild3(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(buildContent.Text);
                c.Publish("byserver", byteToSend);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnBuild4(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(buildContent2.Text);
                c2.Publish("byserver", byteToSend);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnSend(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(sendContent.Text);
                s.Send(byteToSend);
                this.sendContent.Text = "{\"action\":\"msg\",\"content\":{\"o_id\":\"54fc44196ca3b51bf0c384ec\",\"from\":\"54fe4fd1d632030368491c95\",\"to\":\"54fe4fe0d632030368491c97\",\"msg\":\"this is from uid 1.\",\"msgid\": \"" + randomStr() + "\"}}";
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnSend2(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(sendContent2.Text);
                s2.Send(byteToSend);
                this.sendContent2.Text = "{\"action\":\"msg\",\"content\":{\"o_id\":\"54fc44196ca3b51bf0c384ec\",\"from\":\"54fe4fe0d632030368491c97\",\"to\":\"54fe4fd1d632030368491c95\",\"msg\":\"this is from uid 2.\",\"msgid\": \"" + randomStr() + "\"}}";
                //this.sendContent3.Text = "{\"action\":\"msg\",\"content\":{\"o_id\":\"101\",\"from\":\"3\",\"to\":\"2\",\"msg\":\"this is from uid 1.\"}}";
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnSend3(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(sendContent.Text);
                c.Publish("byserver", byteToSend);
                this.sendContent.Text = "{\"action\":\"msg\",\"content\":{\"o_id\":\"54fc44196ca3b51bf0c384ec\",\"from\":\"54fe4fd1d632030368491c95\",\"to\":\"54fe4fe0d632030368491c97\",\"msg\":\"this is from uid 1.\",\"msgid\": \"" + randomStr() + "\"}}";
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnSend4(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(sendContent2.Text);
                c2.Publish("byserver", byteToSend);
                this.sendContent2.Text = "{\"action\":\"msg\",\"content\":{\"o_id\":\"54fc44196ca3b51bf0c384ec\",\"from\":\"54fe4fe0d632030368491c97\",\"to\":\"54fe4fd1d632030368491c95\",\"msg\":\"this is from uid 2.\",\"msgid\": \"" + randomStr() + "\"}}";
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnOrder(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(orderContent.Text);
                s.Send(byteToSend);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnOrder2(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(orderContent2.Text);
                s2.Send(byteToSend);
                
                
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnOrder3(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(orderContent.Text);
                c.Publish("byserver", byteToSend);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnOrder4(object seder, RoutedEventArgs e)
        {
            //send
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes(orderContent2.Text);
                c2.Publish("byserver", byteToSend);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnDispose(object seder, RoutedEventArgs e)
        {
            //dispose
            try
            {
                s.Dispose();
                t.Abort();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnDispose2(object seder, RoutedEventArgs e)
        {
            //dispose
            try
            {
                t2.Abort();
                s2.Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void OnDispose3(object seder, RoutedEventArgs e)
        {
            //dispose
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes("{\"action\":\"disconnect\",\"content\":{\"uid\":\"" + this.UID.Text + "\"}}");
                c.Publish("byserver", byteToSend);
                Thread.Sleep(1000);
                c.Disconnect();
            }
            catch (Exception ex)
            {
                MessageBox.Show("client1 error " + ex.Message);
            }
        }
        private void OnDispose4(object seder, RoutedEventArgs e)
        {
            //dispose
            try
            {
                byte[] byteToSend = Encoding.UTF8.GetBytes("{\"action\":\"disconnect\",\"content\":{\"uid\":\"" + this.UID2.Text + "\"}}");
                c2.Publish("byserver", byteToSend);
                Thread.Sleep(1000);
                c2.Disconnect();
            }
            catch (Exception ex)
            {
                MessageBox.Show("client2 error " + ex.Message);
            }
        }
        private void ReadMSG()
        {
            try
            {
                while (true)
                {
                    byte[] bytesRead = new byte[1024];
                    int count = s.Receive(bytesRead);
                    if (count > 0)
                    {
                        string strRead = Encoding.UTF8.GetString(bytesRead, 0, count);
                        this.Dispatcher.BeginInvoke((Action)(() =>
                        {
                            this.msgRec.Text = strRead;
                        }));
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void ReadMSG2()
        {
            try
            {
                while (true)
                {
                    byte[] bytesRead = new byte[1024];
                    int count = s2.Receive(bytesRead);
                    if (count > 0)
                    {
                        string strRead = Encoding.UTF8.GetString(bytesRead, 0, count);
                        this.Dispatcher.BeginInvoke((Action)(() =>
                        {
                            this.msgRec2.Text = strRead;
                        }));
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }

        //const string MQTT_BROKER_ADDRESS = "182.92.164.34";
        const string MQTT_BROKER_ADDRESS = "127.0.0.1";
        MqttClient client;
        MqttClient client2;
        private void OnTest(object sender, RoutedEventArgs e)
        {
            if (client != null && client.IsConnected)
            {
                client.Disconnect();
                return;
            }
            // create client instance 
            //client = new MqttClient(IPAddress.Parse(MQTT_BROKER_ADDRESS));
            client = new MqttClient("182.92.161.167", 1883, false, null);

            // register to message received 
            client.MqttMsgPublishReceived += client_MqttMsgPublishReceived;
            client.MqttMsgPublished += client_MqttMsgPublished;
            client.ConnectionClosed += client_ConnectionClosed;

            string clientId = Guid.NewGuid().ToString();
            client.Connect("test1testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest", "", "", false, 90);

            // subscribe to the topic "/home/temperature" with QoS 2 
            //client.Subscribe(new string[] { "/home/temperature", "12311", "12312", "12313", "12314", "12315", "12316", "12317", "12318", "12319", "12320", "12321", "12322", "12323", "12324", "12325", "12326", "12327", "12328", "12329", "12330", "12331", "12332", "12333", "12334", "12335", "12336", "12337", "12338", "12339", "12340", "12341", "12342", "12343", "12344", "12345", "12346", "12347", "12348", "12349", "12350", "12351", "12352", "12353", "12354", "12355", "12356", "12357", "12358", "12359", "12360", "12361", "12362", "12363", "12364", "12365", "12366", "12367", "12368", "12369", "12370" }, new byte[] { MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE });
            client.Subscribe(new string[] { "test1" }, new byte[] { MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE });

        }

        void client_MqttMsgPublished(object sender, MqttMsgPublishedEventArgs e)
        {
            
        }

        void client_ConnectionClosed(object sender, EventArgs e)
        {
            
        }
        private void OnTest2(object sender, RoutedEventArgs e)
        {
            client2 = new MqttClient("182.92.161.167", 1883, false, null);
            client2.Connect("ididid");
            client2.Subscribe(new string[] { "test2" }, new byte[] { MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE });
            client2.MqttMsgPublishReceived += mc_MqttMsgPublishReceived;

        }

        void mc_MqttMsgPublishReceived(object sender, MqttMsgPublishEventArgs e)
        {
            MessageBox.Show(Encoding.UTF8.GetString(e.Message));
        }
        
        static void client_MqttMsgPublishReceived(object sender, MqttMsgPublishEventArgs e)
        {
            // handle message received 
            MessageBox.Show("client1 received: " + Encoding.UTF8.GetString(e.Message));
        }

        private void OnTest3(object sender, RoutedEventArgs e)
        {

            //// create client instance 
            ////client2 = new MqttClient(IPAddress.Parse(MQTT_BROKER_ADDRESS));
            //client2 = new MqttClient("182.92.161.167", 1883, false, null);

            //// register to message received 
            //client2.MqttMsgPublishReceived += client_MqttMsgPublishReceived2;
            //client2.ConnectionClosed += client2_ConnectionClosed;
            //client2.MqttMsgPublished += client2_MqttMsgPublished;

            //string clientId = Guid.NewGuid().ToString();
            //client2.Connect("mTest2");

            //// subscribe to the topic "/home/temperature" with QoS 2 
            //client2.Subscribe(new string[] { "123456" }, new byte[] { MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE });

            byte[] bMsg = Encoding.UTF8.GetBytes("Hello World, test1, retained.111");
            client2.Publish("test1", bMsg, MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE, true);
            

        }


        void client2_MqttMsgPublished(object sender, MqttMsgPublishedEventArgs e)
        {
            
        }

        void client2_ConnectionClosed(object sender, EventArgs e)
        {
            
        }

        private void OnTest4(object sender, RoutedEventArgs e)
        {
            byte[] bMsg = Encoding.UTF8.GetBytes("Hello World, test1");
            client2.Publish("test1", bMsg);
        }
        static void client_MqttMsgPublishReceived2(object sender, MqttMsgPublishEventArgs e)
        {
            // handle message received 
            MessageBox.Show("client2 received: " + Encoding.UTF8.GetString(e.Message));
        }

        
        
        private string randomStr()
        {
            Random r = new Random();
            int ri = r.Next(100000000, 999999999);
            return ri.ToString();
        }

        List<MqttClient> mqttList;
        List<Thread> tList;
        int cnt;
        private void OnPressClick(object sender, RoutedEventArgs e)
        {
            mqttList = new List<MqttClient>();
            tList = new List<Thread>();
            cnt = 0;

            Thread th = new Thread(thd);
            th.Start();
            
        }

        private void OnAddClick(object sender, RoutedEventArgs e)
        {
            Thread th = new Thread(thd);
            th.Start();
        }

        private void thd()
        {
            for (int i = 0; i < 100; i++)
            {
                Thread tt = new Thread(conn);
                tt.Start();
                tList.Add(tt);
                this.Dispatcher.BeginInvoke((Action)(() =>
                {
                    this.tcount.Text = i.ToString();
                }));
            }
            //MessageBox.Show("complete!");
        }

        private void conn()
        {
            for (int i = 0; i < 2; i++)
            {
                try
                {
                    cnt++;
                    MqttClient mc = new MqttClient("10.10.57.154", 1883, false, null);
                    mc.Connect(randomStr());
                    mc.Subscribe(new string[] { "123456" }, new byte[] { MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE });
                    mqttList.Add(mc);
                    this.Dispatcher.BeginInvoke((Action)(() =>
                    {
                        this.count.Text = cnt.ToString();
                    }));
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message);
                }
            }
        }
    }

    public class Client
    {
        public Client(string ip)
        {
            mc = new MqttClient(ip, 1883, false, null);
        }
        public MqttClient mc;
    }
}
