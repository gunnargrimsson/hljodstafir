#  Hljóðstafir
  Next.js webapp utilizing a new and improved Ascanius for EPUB files

# Setup
  ## Docker
  Build docker image with Dockerfile

    docker build -t hljodstafir .

---

  ## Manual Installation - Linux
  1. Make sure you have python and python cli calls python3 not 2.7

    apt-get update && apt-get install -y --no-install-recommends python3 python3-pip python3-dev python-is-python3 curl wget git
  2. Install Node and yarn
    
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -y nodejs build-essential && npm install --global yarn
  3. Install Aeneas dependencies

    wget https://raw.githubusercontent.com/readbeyond/aeneas/master/install_dependencies.sh
    bash install_dependencies.sh
  4. Install python dependencies & aeneas
    
    pip3 install numpy mutagen html5lib 
    pip3 install aeneas
  5. Check whether you installed **aeneas** correctly
    
    python -m aeneas.diagnostics
  6. Install node modules 
    
    yarn install
  7. Add required private keys to .env.local
  8. Run Webapp (production or development)
    
    yarn build && yarn start
    yarn dev

  ## .env.local requires a set of private keys
  - NEXTAUTH_UUID_NAMESPACE: Valid UUID
  - NEXTAUTH_GOOGLE_ID: Google OAuth 2.0 credential
  - NEXTAUTH_GOOGLE_SECRET: Google OAuth 2.0 credential
  - NEXTAUTH_SECRET: String
  - NEXTAUTH_URL: Valid URL