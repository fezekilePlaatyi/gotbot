# GotBot Messenger

[By Fezekile Plaatyi](mailto:fezekileplaatyi@gmail.com)

This is a MEAN Stack Application which is a Facebook Messenger Chat app. Communicating with Facebook through Webhooks and GraphQL. It uses Socket.io to communicate with the Angular client app.


## Installation

This app is containerized using  [Docker](https://www.docker.com/products/docker-desktop/), to run it you need to have docker installed and available on   **PATH**  then run the following command.

```bash
docker-compose up
```
This command will prepare and run the app. The details Dockerfile and docker-compose.yml are also uploaded in this repo which carries the details about the builds and container for this app. The Angular client app can be then found at:
```bash
http://localhost:4200/
```

## Communication with Messenger

You have to secure and expose your local server to the public using  [NGROK](https://ngrok.com/). Details 



