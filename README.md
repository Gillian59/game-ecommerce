# Video-games templating

## Usage


### Récupérer le code de github sur votre machine

git pull origin master

### Créer une nouvelle feature ou faire un nouveau changement

git checkout -b nom-de-ma-branche

puis on fait des modifs...

puis : 

git add .

git commit -m "On explique ce qu'on a fait"

git push nom-de-ma-branche (ou rien)

### Git and Heroku

Change remotes from this project to match yours!

### Setup the app

```bash
asdf install
yarn install
```

⚠️⚠️ Don't forget to add your `.env` file!

```bash
PORT=8080
MONGODB_URI=*****************************************
```

### Use the app

```bash
# development environment
yarn dev
```

### Database utilities

```bash
# Drop all tables
yarn db:drop

# Seed database
yarn db:seed

# Reset database (drop + seed)
yarn db:reset
```

## Enpoints

### In web browser

- All games: [http://localhost:8080/games](http://localhost:8080/games)
- One game: [http://localhost:8080/slugOfTheGame](http://localhost:8080/games/slugOfTheGame)
- All platforms: [http://localhost:8080/platforms](http://localhost:8080/platforms)
- One platform: [http://localhost:8080/platforms/slugOfThePlatform](http://localhost:8080/platforms/slugOfThePlatform)

### Rest client

- `GET /platforms`
- `POST /platforms`
- `GET /platforms/:slug`
- `GET /games/`
- `GET /games/:slug`

