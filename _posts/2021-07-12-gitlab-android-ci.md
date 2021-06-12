---
layout: post
current: post
cover: assets/images/pipeline.jpg
navigation: True
title: Breaking the Multimodule Project Frontier at GitLab
date: 12th June 2021 02:47:00
tags: [ci]
class: post-template
subclass: 'post'
author: stvayush
---

*"An epic quote that bounces off your head xD"*

## The GitLab CI
Hi, you must have gone through [this post by Jason Lenny](https://about.gitlab.com/blog/2018/10/24/setting-up-gitlab-ci-for-android-projects/) for setting up
CI for android projects at GitLab, it works pretty well till you have single
project i.e., don’t have nested/sub-projects or don’t install NDK in the runtime
at GitLab CI. When either of the case occurs, it becomes somewhat tricky to
write a robust and clean CI script for the android project. Obviously, there are
solutions to this problem, I am going to write the one that we followed in our
project [irde.st](https://git.irde.st/we/irdest).

## Challenges
First of all let's see the problems that arise:
* With the multimodular project, it seems difficult to run different ci files from the top level one(the one that sits at the root of the project).
* Specifically with NDK installation at CI, what happens is that the installation process is *very* verbose that fills up the entire logs console(or better to say, it kinda spams the log output) and version control platforms have an upper limit of logs to display in console set, after which it doesn't show the output. This NDK installation coupled with the SDK installation process that you carry out for preparing the android-build-env(if you use a plain JDK 8 docker image), also adds to the log spam, most of which is irrelevant (if you have your environment variables set correctly) and what matters then the most is the output/logs generated when you run the Build, Test, StaticAnalysis checks and find where any of the checks fail, but due to limited logs being displayed in the console it becomes difficult or almost impossible. 

<p align="center">
  <img src="assets/images/gitlab-ci-log-limit-exceeded.png">
  <small>Logs in GitLab are displayed to a specific size</small>
</p>

* The solution for problem #1 over the internet isn't clearly given anywhere, there are just vague mentions of do like this and it'll work, here we'll see how to actually implement the desired fix.

* For problem #2, I haven't seen any blog that targets our problem and explains + implements the fix. It is a real serious problem with log collection.

## Solution - A Blueprint




So Irdest had both the problems initially, i.e., it is a multi-modular project
that comprises of native rust library and clients hubd, docker & android. The
project is structured in such a way that rust library lies at the root of the
repository and hubd, docker & android are the parallel layers inside the rust
library; also, we use NDK to use rust library on our android client– irdest-droid.
So here is a catch: You can use ci file from your inner p