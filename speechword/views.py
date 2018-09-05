from django.shortcuts import render, redirect, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .forms import UserForm, LoginForm
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
import json
import urllib3
import base64
openApiURL = "http://aiopen.etri.re.kr:8000/WiseASR/Pronunciation"
accessKey = "<KEY>"
languageCode = "english"


def index(request):
    context = {}
    return render(request, "index.html", context)


def signup(request):
    if request.method == "POST":
        form = UserForm(request.POST)
        if form.is_valid():
            new_user = User.objects.create_user(**form.cleaned_data)
            login(request, new_user)
            return redirect('index')
        return HttpResponse("회원가입 실패")

    else:
        form = UserForm()
        return render(request, 'adduser.html', {'form': form})


def signin(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username = username, password = password)
        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            return HttpResponse('로그인 실패. 다시 시도해보세요.')
    else:
        form = LoginForm()
        return render(request, 'login.html', {'form': form})


def evaluation(request):
    context = {
        "title": "발음 평가",
        "sentences": [
            "HI",
            "Hello",
            "What time is it now?",
            "What the fuck?",
            "What's up?"
        ]
    }
    return render(request, "evaluation.html", context)


def logout_view(request):
    logout(request)
    return redirect('index')


@csrf_exempt
def send(request):
    body_unicode = request.body.decode("utf-8")
    json_data = json.loads(body_unicode)
    audio = json_data['audio']
    script = json_data['script']
    script = script.replace("?", ".")
    request_json = {
        "access_key": accessKey,
        "argument": {
            "language_code": languageCode,
            "script": script,
            "audio": audio
        }
    }
    http = urllib3.PoolManager()
    response = http.request(
        "POST",
        openApiURL,
        headers={"Content-Type": "application/json; charset=UTF-8"},
        body=json.dumps(request_json).encode('utf-8')
    )
    print(response.data)
    return HttpResponse(response.data)


