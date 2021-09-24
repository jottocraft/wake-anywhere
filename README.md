# Wake Anywhere

Power on your devices securely from anywhere in the world with Wake-on-LAN and Cloudflare

## Overview

Wake Anywhere works using 2 main parts:

- A web dashboard
    - The web dashboard runs on a Cloudflare Worker. The worker is responsible for serving the frontend assets, providing an API for configured networks/devices in Cloudflare KV, and providing an API for communicating with on-premises controllers.
    - Secured via Cloudflare Access
- One or more on-premises controller devices for sending the Wake-on-LAN packets
    - Interfaces with the web dashboard worker using a REST API connected over a Cloudflare Tunnel
    - Each controller tunnel is routed to a DNS name and has a secret

## Setting up

### Prerequisites

- At least one target device that you want to wake up remotely
    - Ensure that Wake-on-LAN is enabled and is working properly before proceeding. You can use an app like [Fing](https://www.fing.com/news/how-to-use-the-wake-on-lan-feature-with-the-fing-app) to test it.
- A controller device for each network you want to wake devices on
    - Ideally a server you're already running or a low-powered device like a Raspberry Pi
    - You can use basically any device you want as long as it can run Node.JS as a service and use Cloudflare Tunnels. The specific commands in this guide are written for a Raspberry Pi on Raspbian; however, the commands should be almost identical for any Debian-based Linux distro.
- A Cloudflare account registered with the domain you want to use


### Deploy the web dashboard

You can use any computer to deploy the web dashboard

#### Configure Cloudflare domain

Before deploying your server, you'll want to have a DNS route and access control set up in Cloudflare to prepare for deploying the worker. 

For DNS, add a placeholder `AAAA` record to the domain you want to use and point it to `100::` to proxy traffic through Cloudflare.

For access control, follow the [steps for self-hosted applications](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps) to restrict access to the domain.

At this point, you should be prompted to login when accessing the site from an incognito tab, and, after login, you should see a 523 Origin Unreachable error. If you are not prompted to authenticate, anybody will be able to get access to your Wake Anywhere dashboard and configuration (which you really don't want).

#### Install software

Make sure you have git installed and wrangler configured following the instructions in the [Getting started with Cloudflare Workers guide](https://developers.cloudflare.com/workers/get-started/guide).


#### Get the code

Clone the GitHub repository and cd into the dashboard folder:

```
git clone https://github.com/jottocraft/wake-anywhere.git
cd wake-anywhere/dashboard
```


#### Configure Wrangler Project

Now, you'll need to update the `wrangler.toml` configuration file to set up the wrangler deployment and Cloudflare KV. 

Go to the [Workers KV section](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces) of the Cloudflare account dashboard and create a new namespace called Wake Anywhere configuration. Copy the ID of this new namespace.

Modify the `wrangler.toml` file with your Cloudflare Account ID, Zone ID, and KV Namespace ID. You can find your account and zone ID from the overview tab in your Cloudflare site dashboard.


#### Publish the wranger project

Now that the configuration file is set, you can deploy the worker to Cloudflare using `wrangler publish`.

Note: The project includes a pre-built copy of the React dashboard in the `build` folder to make things a bit easier. If you're interested in modifying the source code, use the standard `npm install` and `npm run build` commands to build your own version.


#### Route to your domain

In your Cloudflare site dashboard, go to the Workers tab and click on Add route. For the route field, type `<YOUR DOMAIN>/*`. For the worker dropdown, select `wake-anywhere-worker` and click save.

At this point, you should be able to load the Wake Anywhere dashboard. Try loading the dashboard in an incognito tab again to make sure that access control is working and that you are prompted to login.

### Deploy controller devices

#### Software Installation

First, make sure that your packages are up-to-date:

`sudo apt update`

Then, install [git](https://git-scm.com/downloads) and [Node.JS with npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm):

`sudo apt install git nodejs npm`

Next, use `npm` to install a Node.JS process manager like [pm2](https://pm2.keymetrics.io/docs/usage/quick-start/), [forever](https://www.npmjs.com/package/forever), or [nodemon](https://nodemon.io/) (I recommend `pm2` for Linux):

`sudo npm i -g pm2`

#### Get the code

Clone the GitHub repository and cd into the controller folder:

```
git clone https://github.com/jottocraft/wake-anywhere.git
cd wake-anywhere/controller
```

Make sure you also install all of the dependencies:

`npm install`

#### Service Configuration

Use your process manager to start the Wake Anywhere controller (`index.js`) and configure it to re-run on system startup. 

For `pm2`, use the following commands:

```
pm2 start index.js
pm2 save
pm2 startup
```

#### Verify that the controller is working

To verify that the server is running, ensure that you can access the HTTP server at port `8667` on the controller. You should see a message that says `Wake Anywhere controller OK`.

#### Tunnel Configuration

Now that the server is working, you'll need to set up the Cloudflare tunnel to securely access the controller's API from the web dashboard.

Follow the [Set up your first tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide) guide to get started and configure `cloudflared`. When setting up the `config.yml` configuration file, use the provided sample for connecting an application, but swap the port with `8667`.

After you've finished setting up the tunnel, you should be able to access the server using the DNS route you added.

Lastly, follow the instructions to [run cloudflared as a service](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/run-tunnel/run-as-service) to keep the Cloudflare tunnel running continuously.

#### Add the controller to the console

First, get the controller secret by running `cat secret` in the controller code directory.

Then, in the Wake Anywhere dashboard, go to Settings -> Networks -> Add. You can name the network whatever you want (probably by its SSID). In the DNS route box, type only the domain name the controller tunnel is routed to without any protocols or paths. In the secret box, paste the secret. Note that the secret will be hidden from the dashboard and will only be used in the backend worker API and in Cloudflare KV.

### Start using Wake Anywhere

Now that you've set up and deployed the Wake Anywhere dashboard and a controller, it's time to actually use Wake Anywhere. Go to Devices -> Add to add your first device. The name can be whatever you want to call it (probably its hostname). Select a network you configured from the dropdown, and paste in the device's MAC address (for the interface it uses to connect to the network your controller is on).

Now, you can just go to the Wake Anywhere dashboard, login with Cloudflare Access, see your devices configured in Cloudflare KV, and use the Cloudflare Workers-powered API to contact your controller over a Cloudflare Tunnel to wake your device.

### Troubleshooting

Here's some tests you can do if something isn't working correctly:

- Test everything (Wake-on-LAN, the controller API, etc.) locally to make sure there isn't a Cloudflare configuration error
- Make sure the tunnel shows up as running in the Cloudflare for Teams Dashboard
- Make sure devices and networks you add show up in your Cloudflare KV namespace
- Use `pm2 logs` or the equivalent command in your process manager to make sure the controller script is working correctly
- Ensure the `secret` file exists in the controller directory
- Try restarting the controller to make sure `cloudflared` and `pm2` automatically re-run on startup 

If you need any help getting Wake Anywhere set up, feel free to email me at [hello@jottocraft.com](mailto:hello@jottocraft.com).