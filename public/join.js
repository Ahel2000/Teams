const create = document.getElementById('name')
const meetingId = document.getElementById('meeting-id')
const submit = document.getElementById('submit')

submit.addEventListener('click',function(e){
    if(create.value === "")return
    if(meetingId === "")return
    window.sessionStorage.setItem('Name',create.value)
    window.location.href = `/${meetingId.value}`
})