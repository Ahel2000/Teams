const create = document.getElementById('name')
const meetingId = document.getElementById('meeting-id')
const submit = document.getElementById('submit')

submit.addEventListener('click',function(e){
    if(create.value === ""){
        alert('Please enter your Name!!!!')
        return
    }

    if(meetingId === ""){
        alert('Enter a valid Meeting Id!!!!')
        return
    }

    
    const video = document.getElementsByName('video')
    const audio = document.getElementsByName('audio')

    if(!video[0].checked && !video[1].checked){
        alert('Enter your preferred video settings!!!!')
        return
    }

    if(!audio[0].checked && !audio[1].checked){
        alert('Enter your preferred audio settings!!!!')
        return
    }

    if(video[0].checked)window.sessionStorage.setItem('VideoSettings','On')
    else window.sessionStorage.setItem('VideoSettings','Off')

    if(audio[0].checked)window.sessionStorage.setItem('AudioSettings','On')
    else window.sessionStorage.setItem('AudioSettings','Off')

    window.sessionStorage.setItem('Name',create.value)
    window.location.href = `/${meetingId.value}`
})