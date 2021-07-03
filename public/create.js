const create = document.getElementById('name')
const submit = document.getElementById('submit')

submit.addEventListener('click',function(e){
    if(create.value === "")return
    const video = document.getElementsByName('video')
    const audio = document.getElementsByName('audio')

    if(!video[0].checked && !video[1].checked)return
    if(!audio[0].checked && !audio[1].checked)return

    if(video[0].checked)window.sessionStorage.setItem('VideoSettings','On')
    else window.sessionStorage.setItem('VideoSettings','Off')

    if(audio[0].checked)window.sessionStorage.setItem('AudioSettings','On')
    else window.sessionStorage.setItem('AudioSettings','Off')
    window.sessionStorage.setItem('Name',create.value)
    window.location.href = "/meeting"
})