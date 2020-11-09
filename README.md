# mongodb-message-store - Message Store

[![Build Status](http://img.shields.io/travis/badges/badgerbadgerbadger.svg?style=flat-square)](https://travis-ci.org/badges/badgerbadgerbadger) 
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

## Table of contents

* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)
* [Test](#test)
* [License](#license)

## General info

A message store implementation of the Eventide project logic for a microservice architecture for MongoDB. It is based on the
message store module found in the book 'Practical Microservices' by Ethan Garofolo. This implementation uses MongoDB
database as storage instad of the [message-db](https://github.com/message-db/message-db). I have also implemented
every part of the code anew and according to my own preferences, for better learning and also to avoid any
copyrights issues. I did this project solely for the purpose of increasing my own understanding of how the microservice
architecture and event sourcing should work.

### Features

* Write messages
* Read messages
* Load entities with projection
* Subscribe to streams

### Sources

* Logic based on code by [Ethan Garofolo](https://github.com/juanpaco) accompanying the book [Practical Microservices](https://pragprog.com/titles/egmicro/practical-microservices/).
* The message and streams naming logics follow the logic of the [Eventide](http://docs.eventide-project.org/user-guide/stream-names/) project.

## Technologies

* [mongoose](https://www.npmjs.com/package/mongoose) 5.10.13 => MongoDB object modeling tool.
* [ava](https://www.npmjs.com/package/ava) 3.13.0 => Test framework
* [uuid](https://www.npmjs.com/package/uuid) 8.3.1
* [mongodb-memory-server](https://www.npmjs.com/package/mongodb-memory-server) 6.9.2 => In memory MongoDB implementation (used for testing).

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
