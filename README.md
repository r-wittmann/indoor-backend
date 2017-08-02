# Backend for the Indoor Navigation Prototype

This repository containes the code for the backend server for the indoor navigation prototype. It is developed in line with the requirements of the course Technical Concepts of Media for the MMT masters program at LMU.
Frontend can be found [here](https://github.com/r-wittmann/indoor-frontend)
Logo manipulation can be found [here](https://github.com/r-wittmann/logo-manipulation)

# Getting Starded

As we just need a REST API with a little logic behind it, we decided to use NodeJS with an Express webserver.  

    $> git clone https://github.com/r-wittmann/indoor-backend.git
    $> cd indoor-backend
    $> npm install
    $> npm run develop

This starts a webserver on localhost:3000 which restarts on every code change in the project.

# Deployment

The backend is deployed on Pivotal Webservices using CloudFoundry. Call ```$>npm run deploy``` to deploy the backend.

&copy; 2017 by [dianadybok](https://github.com/dianadybok), [lottemacchiato](https://github.com/lottemacchiato), [r-wittmann](https://github.com/r-wittmann) and [yusef7](https://github.com/yusef7). All rights reserved.
