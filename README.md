# Alexa2Clova
AlexaのスキルモデルJSONをもとにClovaのスキルモデルTSVを出力します。  
`-r`オプションをつければClovaのスキルモデルTSVからAlexaのスキルモデルJSONを出力します。  

※2018/10/30時点の仕様に対応。  

# Usage

## Install

```
git clone https://github.com/miso-develop/alexa2clova .
```

## AlexaスキルモデルJSONからClovaスキルモデルTSVを出力

### alexa.jsonの作成
「index.js」と同じディレクトリに「alexa.json」を作成。  
「alexa developer console」の「JSON Editor」のJSONをコピペ。  

```
touch alexa.json
## ↑にJSON Editorの中身をコピペ！
```

### TSVのエクスポート

```
node index.js alexa.json
```

`alexa2clova`ディレクトリとその配下に`intents`ディレクトリと`slots`ディレクトリが作成され、TSVが出力されます。  
あとは「Clova Developer Center」の対話モデル画面からアップロード！  



## ClovaスキルモデルTSVからAlexaスキルモデルJSONを出力

### Clovaスキルモデルのダウンロード
「Clova Developer Center」の対話モデル画面よりインテント、スロットタイプをそれぞれダウンロード。  
「index.js」と同じディレクトリに「clova」ディレクトリを作成し、ダウンロードしたTSVを格納。  

```
mkdir clova
## ↑にダウンロードしたTSVを格納！
```

### JSONのエクスポート

```
node index.js -r clova
```

「clova2alexa.json」が出力されます。  
あとは「alexa developer console」の「JSON Editor」にD&D！  

# Contribution
1. Fork it
1. Create your feature branch
1. Commit your changes
1. Push to the branch
1. Create new Pull Request

# License
MIT
