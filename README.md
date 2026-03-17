# NF Domains (NFD) Site

This is an **unaffiliated** project for **NF Domains (NFD)**.

It is a basic React site built with **Vite** that shows the details of the NFD contract using the **NFD SDK** and **use-wallet**.

## Features

- Display details of the NFD contract.
- Integration with NFD SDK.
- Wallet connection support via use-wallet.

## Tech Stack

- **Framework:** React
- **Build Tool:** Vite
- **NFD Integration:** NFD SDK
- **Wallet Connection:** use-wallet

## Getting Started

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm run dev
```

### Build

 Build the project for production:
 ```bash
 npm run build
 ```
 
## Deployment

### 1. NFD DNS Configuration

Before deploying, you must configure your NFD's DNS settings:

- **A Record**: Point your NFD's hostname (e.g., `shoretech.algo.xyz`) to your server's public IP address.
- **CAA Records**: Add the following CAA records to allow Let's Encrypt to issue certificates for your domain:
  - `0 issue "letsencrypt.org"`
  - `0 issuewild "letsencrypt.org"`

### 2. Build for Production

Generate the production build locally:

```bash
npm run build
```

### 3. Remote Host Setup

On your remote server, create the root directory for your site and copy the contents of the `dist` folder to it:

```bash
sudo mkdir -p /var/www/shoretech.algo.xyz
sudo chown -R www-data:www-data /var/www/shoretech.algo.xyz
# Copy assets from your local dist/ to /var/www/shoretech.algo.xyz
```

### 4. NGINX Configuration

Create an NGINX server block configuration (e.g., `/etc/nginx/sites-available/shoretech.algo.xyz`):

```nginx
server {
	listen 80 default_server;
	listen [::]:80 default_server;

	server_name shoretech.algo.xyz;
	root /var/www/shoretech.algo.xyz;
	index index.html;

	location / {
		try_files $uri $uri/ =404;
	}
}
```

Enable the site and reload NGINX:

```bash
sudo ln -s /etc/nginx/sites-available/shoretech.algo.xyz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL with Certbot

Install Certbot via Snap, then provision your certificate:

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d shoretech.algo.xyz
```

## License

This project is released under the [Unlicense](./LICENSE).

## Disclaimer

This project is not affiliated with NF Domains. It is an independent project created for informational and development purposes.
