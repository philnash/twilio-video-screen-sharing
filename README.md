# Twilio Video Quickstart with Screen Sharing for JavaScript

This application is an example of screen sharing over WebRTC connections using
Twilio Video. It is forked from the [Twilio Video Quickstart](https://github.com/twilio/video-quickstart-js)
and is extended to include screen sharing in browsers that support it.

To run this application yourself you will need the following credentials:

* Account SID: Your primary Twilio account identifier - find this [in the console here](https://www.twilio.com/console).
* API Key: Used to authenticate - [generate one here](https://www.twilio.com/console/video/dev-tools/api-keys).
* API Secret: Used to authenticate - [just like the above, you'll get one here](https://www.twilio.com/console/video/dev-tools/api-keys).

## A Note on API Keys

When you generate an API key pair at the URLs above, your API Secret will only
be shown once - make sure to save this in a secure location,
or possibly your `~/.bash_profile`.

## Setting Up The Application

Create a configuration file for your application:
```bash
cp .env.template .env
```

Edit `.env` with the configuration parameters we gathered from above.

Next, we need to install our dependencies from npm:
```bash
npm install
```

Now we should be all set! Run the application:
```bash
npm start
```

Your application should now be running at [http://localhost:3000](http://localhost:3000). Just enter
the name of the room you want to join and click on 'Join Room'. Then,
open another tab and join the same room. Now, you should see your own
video in both the tabs!

![screenshot of chat app](https://s3.amazonaws.com/com.twilio.prod.twilio-docs/images/video2.original.png)

## License

MIT
