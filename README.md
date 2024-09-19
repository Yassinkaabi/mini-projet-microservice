# Introduction
Welcome to the Food-Menu Management System! This project is designed to help users
manage food items and menus efficiently using a microservices architecture with gRPC and GraphQL.

## :ledger: Index

- [About](#beginner-about)
- [Usage](#zap-usage)
  - [Installation](#electric_plug-installation)
  - [Commands](#package-commands)
- [Development](#wrench-development)
  - [Pre-Requisites](#notebook-pre-requisites)
  - [Developmen Environment](#nut_and_bolt-development-environment)
  - [File Structure](#file_folder-file-structure)
  - [Build](#hammer-build)  
- [Community](#cherry_blossom-community)
  - [Contribution](#fire-contribution)
  - [Branches](#cactus-branches)
  - [Guideline](#exclamation-guideline)  
- [FAQ](#question-faq)
- [Resources](#page_facing_up-resources)
- [Gallery](#camera-gallery)
- [Credit/Acknowledgment](#star2-creditacknowledgment)
- [License](#lock-license)

##  :beginner: About
The Food-Menu Management System allows users to create and manage food items and 
associate them with menus. It leverages a microservices architecture using gRPC 
for inter-service communication and GraphQL for querying and mutating data.

## :zap: Usage
This section covers how to use the Food-Menu Management System.

###  :electric_plug: Installation
Follow these steps to install and set up the project.

1. Clone the repository:
 
  - git clone https://github.com/Yassinkaabi/mini-projet-microservice
  - cd food-menu-management


###  :package: Commands
- cd mini-projet-microservice
  
  . Start the Food Service:
    nodemon foodMicroservice.js
  
  . Start the Food Service:
    nodemon menuMicroservice.js

  . Start the Food Service:
    nodemon apiGateway.js

##  :wrench: Development
Guidelines for contributing to the Food-Menu Management System.

### :notebook: Pre-Requisites
Node.js (v14 or higher)
npm (v6 or higher)
MongoDB
gRPC

Ensure MongoDB is running:


###  :file_folder: File Structure
Add a file structure here with the basic details about files, below is an example.

```
.
.
├── mini-projet-microservice
│   ├── api
│   │   └── apiGateway.js
│   │   └── resolvers.js
│   ├── database
│   │   └── db.js
|   ├── models
|   |   └── foodModel.js
|   |   └── menuModel.js
│   ├── proto
│   │   └── food.proto
│   │   └── menu.proto
│   ├── services
│   │   ├── foodMicroservice.js
│   │   ├── menuMicroservice.js
│   ├── kafkaHelper.js
│   ├── schema.js
│   ├── package.json
│   ├── package-lock.json
└── README.md

```

###  :hammer: Build
npm install


 ### :cactus: Branches

 I use an agile continuous integration methodology, so the version is frequently updated and development is really fast.

. **`main`** is the production branch.


### :exclamation: Guideline
Please follow our coding guidelines and best practices when contributing.


##  :page_facing_up: Resources
gRPC Documentation
GraphQL Documentation
Node.js Documentation
