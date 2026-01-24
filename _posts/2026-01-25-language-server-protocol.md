---
layout: post
current: post
cover: assets/images/lsp-cover.jpg
navigation: True
title: Need for LSP - Conceiving the Notion
date: 25th January 2025 04:12:00
tags: [lsp, programming]
class: post-template
subclass: 'post'
author: stvayush
---

## Introduction
Ever wondered how auto-completions / syntax check for a particular programming language(hereafter referred as PL) works in IDEs out of the box? Here, we'll be conceiving the core underlying notion for the LSP and lang servers with examples.

## Problem Statement
Every PL has their own grammar where a particular set of characters makes sense, this is about the field, methods, class etc. declarations / definitions and so on. In order for the editor to make sense of this grammar, it first needs to know about it's existence and then interact w/ it.

1. Let's assume we build an editor which knows how to interact w/ one PL's grammar.

2. Now if we want to add support for another language then we'll have to perform some work again.

3. Similarly, if some other person creates an editor, then they also will have to write implementation to support those PLs.

> ### Motivation
Considering a very small word with 4 PLs and 5 editors, there would need to be
`5 * 4` implementations for the very same 4 PLs in total(operating under the assumption that those 5 editors hardly have anything in common which allows re-usability of the implementation in one). So, for `m` PLs and `n` editors, this becomes an `m * n` problem.

## Solution
Here, by taking a look at the bigger picture we know that grammar for 1 PL is essentially to generate the same code sanity suggestions(completions and syntax errors) for every editor, but still different implementations have to be done.

With this notion and abstraction under consideration, it can be thought to take the grammar out of the editor itself and re-use in such a way that any editor can understand.

Now, with in order to perform the aforementioned there needs to be some standardization made, protocol which specifies how an editor is supposed to interact with a PL's grammar. This is known is **Language Server Protocol(LSP)**.

## LSP - Putting things together
By this point we have a detailed spec which specifies interaction b/w grammar and editor. This spec is just an abstraction for the interaction, hence there is nothing concrete for our editor to interact with. The concretion of this protocol for a particular PL is known as that **Language Server** for it. Language Server is where all the things like syntax errors, completions, documentation popup on hover is implemented while abiding by the LSP specs. This is what enables the editors to understand the grammar and perform checks in realtime.

> This also changes the complexity of the initial problem to `(m + n)`, because now every editor only needs to interact with the language server _only_.

Certainly, modern editors do have a bunch of improvements which keeps them from interacting with Language Server for every single thing, but the core underlying notion is this.

This is a very high level overview of what Language Servers are and LSP, and why they were needed in the first place.

I found it interesting and implemented some very basic components for a toy language, to gain familiarity with the LSP and GoLang. You can give it a look too over [here](https://github.com/s-ayush2903/custom-lsp).

Further reading:

- **LSP**: [https://microsoft.github.io/language-server-protocol/](https://microsoft.github.io/language-server-protocol/)

- **LSP impls**: [https://microsoft.github.io/language-server-protocol/implementors/servers/](https://microsoft.github.io/language-server-protocol/implementors/servers/)
