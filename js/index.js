var skillElement;
const skills = { "python": "2020/05/01", "js": "2021/01/20", "html": "2019/09/02", "css": "2019/09/02" }
for (const key in skills) {
    skillElement = document.getElementById(key)
    var years = new Date(new Date() - new Date(skills[key])).getFullYear() - 1970;
    skillElement.innerText = `${key[0].toUpperCase() + key.slice(1, key.length)} (Exp: ${years}yrs)`
}