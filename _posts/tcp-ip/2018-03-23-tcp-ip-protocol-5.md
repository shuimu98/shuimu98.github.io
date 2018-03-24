---
layout: post
title:  "TCP/IP协议族详解（五）"
date:   2018-03-23
excerpt: "这个系列的文章主要详细了解TCP/IP协议族，本篇主要介绍TCP传输协议"
tag:
- TCP/IP
comments: true
---


本系列文章是**教程：**[TCP、IP协议族详解](http://study.163.com/course/courseMain.htm?courseId=1003343002)的学习笔记。

该系列大概分为下面几个部分：

- 1、TCP/IP协议4层结构以及每层的作用
- 2、IP协议详解
- 3、ARP协议和RARP协议详解
- 4、ICMP协议详解
- 5、TCP协议详解
- 6、UDP协议详解

本文主要介绍TCP/IP网络体系中网络层的TCP协议。

在介绍TCP协议之前，让我们先了解一下传输层。

## 1、网络层与传输层关系

先举一个生活中的例子，假如我在京东上购买了一个物品，发货方为上海的某个商家，收货方就是我的公司地址，比如说是：`双击省老铁市666区没毛病软件园A座`。但是A座这栋楼很大，快递员不知道我具体在哪一层哪个室，这里就需要一个门牌号，比如说`666号`。

那么，套路上面的例子，`双击省老铁市666区没毛病软件园A座`这个地址就类似IP地址，它工作于网络层，它能定位到一块具体的位置，也是就A座这台电脑，在A座这栋楼里面的各个公司就是计算机中的各个进程，每个公司（进程）都占有一个门牌号，这个门牌号就是端口号，**端口号这个概念就属于传输层**。

两台主机间通信条件：
	
1. 本地主机 IP
2. 远程主机 IP 

两台主机进程间通信条件：

1. 本地主机 IP
2. 本地进程 端口
3. 远程主机 IP 
4. 远程进程 端口

因此，可以简单的理解：网络层（这里指IP协议）提供**主机**之间的逻辑通信，传输层（这里指TCP或者UDP协议）提供提供**进程**之间的逻辑通信。

## 2、传输层协议详解


### 传输层功能
- 分段及封装应用层送来的数据
 
	例如：我们运送水果，不可能一个一个的运送，一般都是将大堆苹果装车后一车一车的运送，每一车装多少个就是分段数据，装车后要用布封起来保鲜就是封装数据

- 提供端到端的传输服务

	即源主机端口到目的主机端口进行通信

- 在发送主机与接收主机之间构建逻辑通信

	如果源主机分别开启Telnet、http访问远程主机的telnet服务和http服务，那么传输层就提供这样一个机制，它构建了两个对应的逻辑通道。



### 端口的范围

端口的大小目前是2个byte，也就是说最大有65536个端口，在0~65535这个范围内，我们又把它分成三个部分：

- 熟知端口(著名端口)：0-1023，由ICANN指派和控制（例如：80端口、22端口等）
- 注册端口：1024-49151,IANA不指派也不控制，但须注册（例如：3306端口，即mysql端口）
- 动态端口(短暂端口)：49152-65535，IANA不指派也不控制，无须注册，可以分配给你自己的应用


## 3、TCP协议详解

核心：TCP协议负责将数据分段成TCP报文段(每一段报文作为传递给IP层的数据)、重组TCP报文段将数据还原。

### TCP协议的特点

- 面向连接：通讯双方交换数据之前必须要先建立连接
- 可靠性：提供了多种确保可靠性的机制
- 字节流服务：8bit（1byte）为最小单位构成的字节流（所以不存在粘包的概念）

### 套接字

套接字（socket）它是ip地址和端口号的一个组合（例如：192.168.2.172:80），它是TCP连接的最基本的、抽象化的一个对象，也就是TCP连接的端点，一个TCP连接有两个端点。

![socket套接字](/images/posts/tcp-ip/socket.png)

### TCP数据传输过程

在底层的实现中，TCP发送端和接收端都有对应的缓存，分别是发送缓存、接收缓存，应用层传递给传输层的数据并不一定立即就发送出去了，而是先放入缓存中，然后等待最合适的时机（网络通畅、对端用空闲等等）再把数据发送出去。同理，接收端也是一样的道理。

另外，需要注意，传输层在向IP层传递数据是，是以分组为单位的，而不是按整个字节流来发送，TCP协议把若干字节构成一个分组后，再投递给IP层，这种的分组就称为报文段（Segment），因此，我们常常说TCP报文段就是这样来的。

举例来说：我去菜市场买了一根很长的黄瓜（现在的黄瓜怎么都长那么长- -），太长不好切，那就先把黄瓜切成一段一段的，然后再对每一段切片。这个切成一段的过程就类似TCP数据分段，分段后再交给IP层。

![TCP数据传输](/images/posts/tcp-ip/tcp.png)


让我们在深入一层，拿上图来说，首先我们要知道两个概念：字节号和报文段序号。

- 字节号，就是上图中环形缓存中未发送的字节，每个字节所对应的编号（一个格子表示一个字节），字节号的范围是（0~2^32-1），生成方式随机（依赖于系统内核的实现方式）

	例如：要发送一个6000byte的数据，并且给第一个字节随机到了一个字节号为1057，那么这6000个字节的数据所对应的字节号就是：1057~7056

- 报文段序号，它是基于前面的字节号，其实就是分段后，第一个字节的字节号

	例如：把上面的6000字节的数据分为5个报文发送，前4个报文每个发送1000个字节，最后一个发送2000个字节。那么这5个报文段的序号依次是：1057、2056、3056、4056、5056

## 4、TCP报文段首部格式


它与IP协议首部格式类型，也分为固定部分（20byte）和可选部分。

![TCP首部格式](/images/posts/tcp-ip/tcp-head.png)

和前面一样，通过抓包来逐个解释每个字段。这里访问一个网站，抓包结果如下：
![TCP首部抓包结果1](/images/posts/tcp-ip/tcp-wireshark-1.png)
![TCP首部抓包结果2](/images/posts/tcp-ip/tcp-wireshark-2.png)

上面两个结果是一次TCP通讯的往返信息，下面以结果2作为例子解释各个字段：

- 第1、2个字节：值为dc ea，十进制为56554，表示源端口，一般如果源端没有bind一个端口的话，这个端口将是动态的，比如我们访问一个http网站，第一次访问可能是56554，刷新网页后端口可能就发生了变化。
- 第3、4个字节：值为00 50，十进制为80（也就是大家熟悉的http服务端口），表示目的端口
 
	注意一下这里的`Stream index:1`，可以看做成一个五元组(源IP、源端口、目的IP、目的端口、传输协议)的编号，只要其中一个发送变化，这个流索引号就会发生变化。

- 第5到8个字节：值为，表示报文段序号（图中显示的是相对位置，至于相对位置和绝对段序号是怎么转换的，我暂时也不太清楚，这里留一个疑问）
- 第9到12个字节：值为，表示确认号
- 第13、14个字节：这里需要特殊处理一下，前4bit表示首部长度，和IP首部一样，也是以4字节为单位；后12个bit



MSS = MTU-TCP首部-IP首部，