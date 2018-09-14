# Alexa2Clova
AlexaのJSONをもとにClovaのインテント、スロット用のインポートTSVを出力します。  

※2018/9/14時点の仕様に対応。  
※逆もまた然れるはずなのでいつか対応します。  

# Usage

## Install

```
git clone https://github.com/miso-develop/alexa2clova
cd alexa2clova
```

## alexa.jsonの作成
「index.js」と同じディレクトリに「alexa.json」を作成。  
「alexa developer console」の「JSON Editor」のJSONをコピペ。  

## tsvファイルのエクスポート

```
node index.js
```

`intents`ディレクトリと`slots`ディレクトリが作成され、その中にtsvがエクスポートされます。  
あとはClova Developer Centerの対話モデル画面からアップロード！  

# Contribution
1. Fork it
1. Create your feature branch
1. Commit your changes
1. Push to the branch
1. Create new Pull Request

# License
MIT
