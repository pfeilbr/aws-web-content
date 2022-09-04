# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.209.6/containers/javascript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 16, 14, 12, 16-bullseye, 14-bullseye, 12-bullseye, 16-buster, 14-buster, 12-buster
#ARG VARIANT="16-bullseye"
# FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# universal codespaces image which include all the common languages
# see <https://github.com/microsoft/vscode-dev-containers/tree/main/containers/codespaces-linux>
FROM mcr.microsoft.com/vscode/devcontainers/universal:linux

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"

# aws cli v2
# ARG AWS_CLI_V2_VERSION="2.5.2"
# RUN curl -L "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-${AWS_CLI_V2_VERSION}.zip" -o "awscliv2.zip" \
#    && unzip awscliv2.zip \
#    && sudo ./aws/install

USER root

# install aws-cli v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
  unzip awscliv2.zip && \
  sudo ./aws/install

# aws sam cli
# ARG SAM_CLI_VERSION="1.43.0"
RUN curl -L https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip -o "aws-sam-cli-linux-x86_64.zip" && \
    unzip "aws-sam-cli-linux-x86_64.zip" -d sam-installation && \
    sudo ./sam-installation/install

# aws cdk
RUN npm -g install typescript && \
    npm install -g aws-cdk

# lumigo-cli
RUN npm install -g lumigo-cli

# terraform
# RUN sudo apt-get update && sudo apt-get install -y gnupg software-properties-common curl
# RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
# RUN sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
# RUN sudo apt-get update && sudo apt-get install terraform

# homebrew installs
# ENV BREW_PREFIX=/home/linuxbrew/.linuxbrew
# ENV PATH=${BREW_PREFIX}/sbin:${BREW_PREFIX}/bin:${PATH}
# RUN brew install jq yq pipx pyenv tree 

USER codespace
    
