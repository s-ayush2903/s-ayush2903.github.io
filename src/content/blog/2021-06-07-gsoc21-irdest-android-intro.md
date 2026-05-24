---
title: "GSoC'21: Irdest Android Client – Overview"
date: 7th June 2021 02:47:00
tags: [gsoc, android, ffi, networking]
description: "Introducing my GSoC 2021 project: building a modern Android client for Irdest, a decentralised mesh networking suite, starting with the Rust–Kotlin FFI layer."
---

*“Somewhere between the bottom of the climb and the summit is the answer to the mystery why we climb.”*


Hello everyone, I am one of the students selected for
Google Summer of Code 2021 for Irdest sub-organization under the umbrella
organization freifunk. If you’re wondering about which topic/project the blog
is focused on, then you may give a look to it [here](https://summerofcode.withgoogle.com/projects/#4792427082153984)!

## Irdest
Well, if you don’t know, then let me first introduce about what Irdest ([irde.st](https://irde.st))
is and what it does/supports. So, Irdest is a software suite that allows users to
create an internet-independent, decentralized, wireless, adhoc mesh network. It
removes all the dependencies of the user from a specific single service and enables
users to create a mesh of their own. In this network mesh, users can communi-
cate to each other via messaging(both, individual and Room) and placing voice
calls. Irdest network mesh service also allows users to share files between them
without relying on the internet. And also when a user enters the Irdest mesh
network(note that user needs not connected to the internet i.e., without having an IP address, it can be a P2P connection over Wi-Fi or Bluetooth), their IP address is completely hidden thereby maintaining privacy and
reducing possible breaches that may occur. In the irdest network mesh, as soon
as a user enters the network, they are assigned an ID, which is a unique crypto-
graphic key that helps identifying the users. All the messages/calls/file transfers
made in Irdest network mesh are completely end to end encrypted, again a pos-
itive sign from security & Privacy perspective. Currently, Irdest is supported
for Linux & Android devices. For android, it is pretty much in incubation state
and there are a bunch of points & directions where we can improve. This summer, I aim to implement some features on android client from the irdest upstream.

> WARNING: This blog has a tons of mentions of FFI, you may get overwhelmed by the term, so it stands for Foreign Function Interface.

## Current Progress & FFI Overview
So this was what Irdest is all about and a higher level overview of how things
really work in it. As mentioned previously, the android client is pretty much in its incubation state, so we wish to implement it in a clean & modern way. So, since we want to make use of
features supported by Irdest(in upstream) on the android application, therefore
we need to maintain/create a binding or kind of a link between core Irdest code
that makes all this internet independent network mesh possible & application
codebase(to call those methods from). The point is that the core Irdest code
that supports these functionalities is written natively in Rust, and we we want
to utilize this pre-written library on android, without writing it again(in Kotlin)
for android. So to make it possible, we’re going to write an FFI Layer(I’ll write
in detail about FFI in some other post, but for the time being it is sufficient to
know that by FFI we can call functions written in a specific language(mostly
native languages like C++, C, Rust) from some other languages). This FFI
layer currently exists in the module, but it is a bit old-fashioned, so in the initial
phase of my coding period I plan and propose to rewrite this layer with best possible modern day FFI practices and following some standard references. The most crucial part of this project is this FFI layer, because it is the fundamental building block for the android project, once it is set and ready, then we’ll be able to use the functions and services provided in the native Irdest library written in Rust and extend our further development process via writing the application.

## FFI Implementation - A Blueprint
The FFI already is quite notorious for the undefined behavior and icing on the cake is, that there is very less official documentation available on Rust-Kotlin FFI so this makes it
more tricky & challenging to implement, but for the course of our development
process, we’ll be following and taking inspiration from how Mozilla have implemented FFI integration between their existing rust library and their firefox android client. Another instance where they use Rust-Kotlin FFI is their Glean project(a telemetry service). I’ll be taking most of the inspiration by and practices being followed in Glean, as a result of which we’ll be writing FFI bindings on our own. After once we’ve written FFI layer, my next step will be to test it
again thoroughly and make sure it works perfectly and does not has any bugs
residing.

## Further Development:
Once we have a robust FFI layer ready, then I’ll move to core android de-
velopment process, that’ll entail writing UI for the application, architecting it
properly, modularizing the application codebase and following the Modern Android Dev practices. Well this will be a relatively easier job to do in comparison to that of writing FFI layer xD My next step after this would be implementing the chat service in the application. We’ll focus in its detailing after we’re done with the very first milestone, the ”FFI Layer”. We'll see the plan of action for chat service in a separate blogpost, after the first coding phase :)


Thanks for reading! 

Cheers, Until next time we meet!

---

*Originally published on the [Freifunk blog](https://blog.freifunk.net/2021/06/07/gsoc21-irdest-android-client-overview/).*
