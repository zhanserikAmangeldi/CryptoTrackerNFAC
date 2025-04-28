# Crypto Tracker by Amangeldi Zhanserik for N!

[http://4.231.56.83/](http://4.231.56.83/)

Crypto Tracker is simple web application for tracking crypto currencies and making portfolio. Users can track prices, search for specific coins, view price charts, and manage their own portfolio to calculate profits and losses. In application we integrated this third-party APIs and SDK:
1. [CoinGecko API](https://www.google.com/search?client=safari&rls=en&q=GeckoApi&ie=UTF-8&oe=UTF-8) for fetching crypto currencies. 
2. [ExchangeRate API](https://www.exchangerate-api.com) for checking exchange rate and convert usd to KZT, that not supported by CoinGecko API directly.
3. [Azure OpenAI SDK](https://www.google.com/search?client=safari&rls=en&q=azureopenai+golang&ie=UTF-8&oe=UTF-8) for powering our application with AI assistant.

## Features

- Crypto currencies data of all coins supported by CoinGecko API.
- Live search functionality that filters cryptocurrencies as you type by names and symbols.
- Personal portfolio management with profit/loss.
- Multi-currency support (USD/EUR/KZT).
- Backend API with 60-second data refresh from CoinGecko and in Frontend data auto-refreshes ever 30 seconds.
- Full-stack deployment on Azure VM using Docker Compose.
- AI-powered cryptocurrency assistant using Azure OpenAI for answering crypto-related questions.

## Usage

### Prerequisites

- Golang
- NPM
- PostgreSQL
- Docker and Docker Compose (for containerized deployment)
- CoinGecko API, ExchangeRate API, Azure OpenAI API key and endpoint (for AI assistant feature)

There are two way to use, it is run manual and with docker-compose, but in both variant you should to write .env files.

1. Clone the repository and go in folder:

```bash
git clone https://github.com/zhanserikAmangeldi/CryptoTrackerNFAC.git && cd CryptoTrackerNFAC
```

2. After that you should fill two `.env.example` files with your own data, first in `./`and second in `./backend`, and change their name to `.env`(only names, not dir). It is need to parse for configs

### Manual

After you feel the `.env.example`, you can start. Do not forget to run up your db :)

#### Backend

There we should to use `Makefile` created by me. First you should go in folder and migrate the schema.

```bash
cd ./backend
make migrate-up
```

After that you could go and also using `Makefile` run the app:

```bash
make run
```

#### Frontend

It is simpler just go to `frontend` folder and start using npm:

```bash
cd ./frontend
npm start
```

It is all for Manual, check the `localhost:3000`

### Docker-Comose

It will be simpler, just run the docker compose up(root folder(where placed docker-compose.yml file)):

```bash
docker-compose up --build
```

You can check the website on `localhost:80`.

I fill hurt when run every time because of mackbook air 256 gb, because of that, you can clear the image and cache data using this command:

```bash
docker-compose down --rmi all --volumes --remove-orphans
```

## Design and Development Process

### Requirements Analysis

The project started by analyzing the CryptoWatcher requirements, which specified three main levels of implementation:

- UI Interface with cryptocurrency listing, search, and portfolio management
- Backend and API integration with CoinGecko for data
- Deployment and bonus task - additional AI assistant functionality

### Architecture Design

After identifying the requirements, I designed a three-tier architecture:

1. Frontend: ReactJS for responsive and interactive UI
2. Backend: Golang API server with PostgreSQL persistence
3. External Services: CoinGecko API integration

It was base architecture, and in the future I add step by step faced by new problems and solutions. Development was in incremental way, integrate something first on back, after front and go to next.

### Development

#### Portfolio on back or only front?

The first question stand in front of me was how to implement the portfolio, and to make project more solid, I choose to implement the portfolio. Yes, after that I need to implement the auth, users and etc.

#### Problem with CoinGecko, Do not support directly KZT

The first problem that I meet was with CoinGecko, CoinGecko do not support KZT, and because of that I should to find solution how to from usd get kzt. For that I add the new API, ExchangeRate API. Using this API, I convert usd from CoinGecko API to KZT. 

Now we Have not only CoinGecko API, but new ExchangeRate API.

#### Background jobs

I knew about the crontab, systemd and etc. and have experience using that, but I think that is over-killing solution, and chose the more golang solution, is **goroutines**.

#### OpenAI API is not Free

The second was with AI assistant, I found out that this is not have free demo, but... Azure give $100 for free, and they have own it solutions for AI servers, Azure OpenAI API. But I do not use the API exactly, I go with easier solutions, it is by SDK, that have proprietary library for golang, bingo!

#### Redis or ?

One of requirements for backend was 60 second fetching data on background, and I ask me yourself, where to save the data in this 60 seconds? Saving in postgresql, was not so good, because every 60 seconds data is gone and I thought about caching.

Redis is good, but I wanted more simpler architecture and choose the **hash mapping** the data.

### Testing Strategy

I tested this application every time after the add something new. I use postman for checking the backend api, and just manual + console.log() for checking frontend.

### Deploying

The last job that was done completely if not look at refactoring.

How I mentioned before I get $100 for free, and think that I should to use this for 100%. I decided to **deploy on Azure**, bcs I have experience with that, and I think it more interesting, than vercel and etc. except that it is more configurable solutions. For deploying I decided to use Dockerfile and docker-compose.

## Unique Approaches

### Concurrent Data Fetching with Go Channels:

I designed a specialized background job system using Go's goroutines and channels for efficient cryptocurrency data fetching.

PS. I do know what could be said like unique approaches, and because of that it is little poor...

## Development Trade-offs

### Client-side vs Server-side Filtering

I implemented cryptocurrency search filtering on the client side rather than server side. This approach provides instantaneous feedback as users type but required sending more data initially to the client. For the current scale, this works well, but for a much larger dataset, server-side filtering would be more efficient.

###  Feature Richness vs Deployment Simplicity

I chose to deploy the entire stack on a single Azure VM using Docker Compose rather than using more specialized services like Azure App Service, Functions, and managed databases. This simplified deployment but sacrificed some scalability features that a more distributed architecture would provide.

### In-Memory Hash Maps vs Redis

I deliberately chose to use Golang's built-in concurrent hash maps instead of Redis for caching. This simplified the architecture by eliminating an additional service dependency and deployment complexity. The trade-off is potentially more limited scalability compared to a distributed Redis cluster, but for the current user base and data volume, the in-memory solution provides sufficient performance while keeping the system architecture cleaner and more maintainable.

### Simplified Authentication

To accelerate development and focus on core functionality, I implemented a simplified authentication system using access tokens only, without the typical refresh token pattern or complex OAuth flows.

### Portfolio multi vs usd only

Because of supporting the eur/kzt, could take many time, and I have no many time, I choose to support only usd in Portfolio.

I maybe have more, but I do not remember and think it is enough.

## Known Issues

### Access Token only Auth

I think it is what I could mention first. I implemented only the access token, without refresh, how I mentioned before.

### Poor code structure

In development I forget about the clean code and make poor structure of my project in both side, frontend and backend. I try to minimize in the end and refactored huge part of code, but even with that, I'm not very pleased with work with `css` especially.

### Deployment is fully manualy / No DevOps

For while, this code is deployed manually using ssh and etc. Thanks, that at least there are docker-compose.

### Portfolio support only USD

It is the biggest problem from user side, it is happened because of my poor time management, sorry :(

## Stack of Technology and Why?

I chose this stack very fast, almost instinctively. No I am not very good/pro dev in this stack, but It is what I know better than other. But I can explain why is good stack:

- Backend - Go: Go is fast, support strong concurrency working(background job) and good for small application because of his microservice nature.
- Frontend - React: React is react, simple, not overwhelmed with file structure like Angular. React's virtual DOM also ensures efficient UI updates when cryptocurrency prices change, providing a smooth user experience with minimal re-renders when data refreshes every 60 seconds
- Database - Postgresql: Simple app, I think every decision will be good, no need to explain, just preferences.

## Video demo

https://youtu.be/2oB15laGM9s

## THE APPLICATION ON REAL

[http://4.231.56.83/](http://4.231.56.83/)

