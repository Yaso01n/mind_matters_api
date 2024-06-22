from flask import Flask, request, jsonify
import EnglishPredict as en
import ArabicPredict as ar

app = Flask(__name__)

def is_arabic(text):
    # Check if any character in the text is Arabic
    for character in text:
        if '\u0600' <= character <= '\u06FF' or '\u0750' <= character <= '\u077F' or '\u08A0' <= character <= '\u08FF':
            return True
    return False


@app.route('/predict', methods=['POST'])
def predict():
    text = request.json.get('text', '')
    # print(text)
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    if is_arabic(text):
        print("arabic")
        result = ar.arabic_prediction(text)
        lang = "arabic"
    else:
        print("en")
        result = en.english_prediction(text)
        lang = "english"

    print(result)
    return jsonify({'response': result, 'lang' : lang})


if __name__ == '__main__':
    # app.run(debug=True)
    app.run(host='0.0.0.0', port=5000)
