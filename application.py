from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World! This is our pharos API!"

# run the app.
if __name__ == "__main__":
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    app.debug = True
    app.run()


# EB needs a flask object called applicaiton
application = app