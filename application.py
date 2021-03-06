from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "Pharos API"

# run the app.
if __name__ == "__main__":
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    app.debug = True
    app.run()


# EB needs a flask object called applicaiton
application = app