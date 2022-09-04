#!/usr/bin/env bash

set -ex

brew install \
    jq \
    yq \
    pipx \
    pyenv \
    tree \
    terraform \
    tmux \
    cfn-lint

# pyenv setup
pyenv install 3.9.13
pyenv global 3.9.13

echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc

# install IJavascript is a javascript kernel for the Jupyter notebook
npm install -g ijavascript
ijsinstall

source ~/.bashrc
