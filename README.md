# mestor - Message Store

[![Build Status](http://img.shields.io/travis/badges/badgerbadgerbadger.svg?style=flat-square)](https://travis-ci.org/badges/badgerbadgerbadger) 
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

## Table of contents

* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)
* [Test](#test)
* [License](#license)

## General info

A message store implementation of the Eventide project logic for a microservice architecture. This is basically my own
implementation of the message-store module found in the book 'Practical Microservices' by Ethan Garofolo. It has been
changed so it runs on a Mongo DB database instead of the Message-DB (based on PostgreSQL). I have also implemented
every part of the code anew and according to my own preferences, for better learning and also to avoid any
copyrights issues. I did this project solely for the purpose of increasing my own understanding of how the microservice
architecture and event sourcing should work.

### Features

* Write messages
* Read messages
* Load entity with projection
* Subscribe to streams

### Sources

* Logic based on code by [Ethan Garofolo](https://github.com/juanpaco) accompanying the book [Practival Microservices](https://pragprog.com/titles/egmicro/practical-microservices/)
* The message and streams naming logics tries to follow the logic of the [Eventide](http://docs.eventide-project.org/user-guide/stream-names/) project

## Technologies

* [mongodb](https://www.npmjs.com/package/mongodb) 3.6.2
* [ava](https://www.npmjs.com/package/ava) 3.13.0
* [uuid](https://www.npmjs.com/package/uuid) 8.3.1

## Setup

### Install

* [node.js](https://nodejs.org/en)
* [MongoDB](https://www.mongodb.com/try/download/community) 3.6.2

## Test

```
$ npm test
```

## License

* **[MIT license](http://opensource.org/licenses/mit-license.php)**
