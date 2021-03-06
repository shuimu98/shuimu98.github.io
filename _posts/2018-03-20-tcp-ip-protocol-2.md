---
layout: post
title:  "TCP/IP协议族详解（二）"
date:   2018-03-20
tag:
- TCP/IP

---


本系列文章是**教程：**[TCP、IP协议族详解](http://study.163.com/course/courseMain.htm?courseId=1003343002)的学习笔记。

该系列大概分为下面几个部分：

- 1、TCP/IP协议4层结构以及每层的作用
- 2、IP协议详解
- 3、ARP协议和RARP协议详解
- 4、ICMP协议详解
- 5、TCP协议详解
- 6、UDP协议详解

本文主要介绍TCP/IP网络体系中网络层的IP协议。

## 1、IP协议的功能

IP协议属于网络层众多协议中，最核心的一个协议。它的主要功能有三个：

1. 寻址和路由
2. 传递服务，有两个特点：不可靠（可靠性由上层协议提供，例如TCP协议）；无连接
3. 数据报分段（Segment）和重组

**什么是寻址和路由？**

举一个生活中的例子：假如我要坐火车从广州到北京，选择的路线有很多种，可以坐京广线、也可以先到南昌，然后再去上海，最后去北京等等。怎么选择路线就类似IP协议的寻址和路由。


**为什么传递数据不可靠？**

IP协议一个重要的原则就是：尽最大可能传递数据，但是数据能不能真的到达目的地，IP协议并没有保证。

**数据报分段和重组**

同样一个生活中的例子：如果要运送一个很大的机器，一次性无法运送完，通常的做法是，拆分后把零部件运送到目的地，当所有的零部件都到达目的地后，最后在目的地进行重新组装。


## 2、IP协议头部格式

IP协议头部格式可以分为两个部分：固定部分（20byte）和可变部分（最大可以为40byte）。所以，IP协议的头部最大是60个字节，但是一般情况下都没有可变部分。

下图为IP协议头部格式：
![IP协议头部](/assets/image/posts/2018-03-20-01.png?style=centerme)

下面，我结合wireshark抓包工具，介绍下IP协议头部固定部分的每个字段的详细意义：

1、使用wireshark抓一个http包，访问的是: http://www.qq.com，结果如下图所示
![抓包结果](/assets/image/posts/2018-03-20-02.png?style=centerme)

可以看到后面的二进制数据，这就是IP协议报文的首部，一共20个字节，其中没有可选部分。
![抓包结果](/assets/image/posts/2018-03-20-03.png?style=centerme)

2、详细解释每个字段的意义

- 第1个字节：值为45(16进制，以下同理)，高四位用来表示IP协议的版本，这里也就是：`0100 .... = Version 4`,低四位用来表示头部长度（注意：单位是4byte），在这里为5(0101)，也就是：`.... 0101 = Header Lenght: 20 bytes（5）`，即4(byte)*5=20(byte)
- 第2个字节：值为00，也就是图中的：`Differentiated Services Field:0x00`，用来获得更好的服务，这个字段以前一直没有被人们使用，这个字段不作详细的解释，只需要知道DTRC，这几个标志只能同时存在一个。但是目前这个字段的使用有些变化，具体也不做详解。
- 第3、4个字节(2byte)： 值为04 0e，也就是十进制1038，也就是图中的：`Total Length: 1038`，表示数据的总长度（IP头部+数据长度，单位为字节），同时，我们可以根据这个数值以及前面的头部长度，计算得出数据包的长度为：1038-20 = 1018byte。另外，也可以知道数据报的最大长度为 **65535** 字节。
- 第5、6个字节：值4c9b，图中为:`Identification: 0x4c9b(19611)`，它是一个计数器，用来产生数据报的标识，它相当于是给IP报文的一个身份证。比如上面运送大型机器的例子，我们在每个运送零部件上贴一个标识，表示它是属于某个机器的（比如说是挖掘机），等所有的零部件都到了后，我们可以根据这个标示，就知道这一批零件是挖掘机的。
- 第7、8个字节：值为4000，这里的16个比特要特殊分配下，**高三位为标示字段**(图中为：`Flags:0x02 （Don't Fragment）`)，**低13位为片偏移**（图中为：`Fragment offset:0`）。

	- 目前标示字段(Flags)只有后两个比特有意义。标志字段的最低位是 MF (More Fragment)。MF=1 表示后面“还有分片”。MF = 0 表示最后一个分片。标志字段中间的一位是 DF (Don't Fragment) 。只有当 DF = 0 时才允许分片，DF=1表示不允许分片。这里的值为:010(二进制)，也就是没有分片，因为数据只有1038byte，一个IP报文就能运送完毕，所以，它不需要分片。
	- 较长的分组在分片后某片在原分组中的相对位置。片偏移以 **8个字节** 为偏移单位。关于片偏移，下面会有一张图，会更加详细的描述其意义。这里值为00 0000，因为这里没有分片，所以它的片偏移也就是0。

- 第9个字节：值为40，也就是10进制的64，它表示TTL（Time to Live），图中为：`Time to Live:64`，也就是这个IP报文在网络中存在的时间，现在用**“跳”**作为TTL的单位，也就是说数据报每经过一个路由器，其TTL值就减一。**为什么需要TTL？它主要是为了处理路由环路**。
	
	可以通过ping命令，例如：`ping www.baidu.com`，显示：`来自 14.215.177.38 的回复: 字节=32 时间=8ms TTL=54`，这里的TTL就表示这个ping命令返回的IP报文的TTL为54，假如TTL最大值为64，也就是说这个IP报文经过了64-54=10个路由节点。

- 第10个字节：值为06，表示上层协议类型，也就是这里的：`Protocol: TCP(6)`
- 第11、12个字节：值为0000，因为wireshark默认没有开启这个功能，所以这里显示0000。它只是**检验数据报的首部不包括数据部分**。
- 第13到16个字节：值为c0 a8 02 67（也就是ip地址192.168.2.103），表示源IP地址
- 第17到20个字节：值为oe 11 2a 28（也就是ip地址14.17.42.40），表示目的IP地址


3、IP 数据报首部的可变部分

- IP 首部的可变部分就是一个选项字段，用来支持排错、测量以及安全等措施，内容很丰富
- 选项字段的长度可变（最大40byte），取决于所选择的项目，增加首部的可变部分是为了增加 IP 数据报的功能，但这同时也使IP 数据报的首部长度成为可变的。这就增加了每一个路由器处理数据报的开销
- 实际上这些选项很少被使用

4、IP数据分片规则

如果一个IP包的数据部分太大，比如超过了65535byte，那么就需要分割成多个IP包发送出去，也就是IP包分片。分片是以8个byte为单位，也就是说一个片为8个字节。

例如：下图要把3800个字节的数据分为3个IP包发出去，第一个包的片偏移为0，第二个包发送的数据是从索引1400（也就是第1401个byte开始），第三个从索引2800处开始。那么每个包的片偏移值 = 数据起始索引值/8。

![IP包分片](/assets/image/posts/2018-03-20-04.png?style=centerme)
