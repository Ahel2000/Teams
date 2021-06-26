const create = document.getElementById('name')
const submit = document.getElementById('submit')

submit.addEventListener('click',function(e){
    if(create.value === "")return
    window.sessionStorage.setItem('Name',create.value)
    window.location.href = "/meeting"
})