// ядро

// функция получения данных с сервера
async function getClientsList(searchString = '') {
    let defaultSrting = 'http://localhost:3000/api/clients';
    if (searchString !== '') defaultSrting += `?search=${searchString}`
    const request = await fetch(defaultSrting);
    const response = await request.json()
    // console.log(response)
    return response;
}
// функция получение оного клиента
async function getClient(id) {
    const request = await fetch(`http://localhost:3000/api/clients/${id}`);
    const response = await request.json()
    // console.log(response)
    return response;
}
// функция добавления клиента на сервер
async function addClient(clientObject) {
    const request = await fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: {
            'Content-Type': 'aplication/json'
        },
        body: JSON.stringify(clientObject)
    })
    const response = await request.json();
    // console.log(response)
    return response
}
// функция удаления клиента с сервера
async function deleteClient(id) {
    await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'DELETE'
    })
}
// функция изменения клиента
async function changeClient(clientObject) {
    const { id, ...client } = clientObject
    const request = await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'aplication/json'
        },
        body: JSON.stringify(client)
    })
    const response = await request.json()
    return response
    // console.log(response)
}

/* прикладной уровень
.....................................................................
*/

// сценарий(функция) получения списка, сортировки и вызов функции рендера
async function fetchClientsList(searchString, field = 'ID', direct = 'ASC') {

    const clientsList = await getClientsList(searchString);

    if (Array.isArray(clientsList)) {
        return clientsList.sort((a, b) => {
            const firstValue = a[field];
            const secondValue = b[field];
            if (firstValue > secondValue) {
                return direct === 'ASC' ? -1 : 1
            }
            if (firstValue < secondValue) {
                return direct === 'ASC' ? 1 : -1
            }
            return 0
        })
    } else
        return []
}

/* уровень адапетров
.....................................................................
*/


// отрисовка массива 
function renderArray(arr) {
    const tbody = document.querySelector('#tbody')
    tbody.innerHTML = ''
    arr.forEach(el => {
        const tr = document.createElement('tr');
        tbody.append(tr)

        const tdID = document.createElement('td')
        tdID.innerHTML = el.id;
        tdID.style.paddingLeft = '10px'
        tr.append(tdID)

        const tdName = document.createElement('td')
        tdName.innerHTML = el.surname + ' ' + el.name + ' ' + el.lastName
        tr.append(tdName)

        const tdCreate = document.createElement('td')
        const currentCreateDate = new Date(el.createdAt)
        tdCreate.innerHTML = currentCreateDate.toLocaleString()
        tr.append(tdCreate)

        const tdUpdate = document.createElement('td')
        const currentUpdateDate = new Date(el.createdAt)
        tdUpdate.innerHTML = currentUpdateDate.toLocaleString()
        tr.append(tdUpdate)

        const imgByType = {
            'Vk': './img/vk.svg',
            'Телефон': './img/phone.svg',
            'FaceBook': './img/fb.svg',
            'E-mail': './img/mail.svg',
            'Другое': './img/other.svg'
        }

        const tdContactsType = document.createElement('td')
        const tdContactsTypeDiv = document.createElement('div')
        tdContactsTypeDiv.id = el.id
        tdContactsTypeDiv.style = `
        display: flex;
        flex-wrap: wrap;
        max-width: 110px;
        `
        el.contacts.forEach((contact, index) => {
            if (index >= 4) {
                tdContactsTypeDiv.innerHTML += `
                <div class="tooltip none">
                <img class="tooltip" src="${imgByType[contact.type]}">
                <div class="tooltiptext">${contact.value}</div>
                </div>
                `
            } else {
                tdContactsTypeDiv.innerHTML += `
                <div class="tooltip">
                <img class="tooltip" src="${imgByType[contact.type]}">
                <div class="tooltiptext">${contact.value}</div>
                </div>`
            }
        })

        if (el.contacts.length > 4) {
            tdContactsTypeDiv.innerHTML += `<button class="showMoreContacts">+${(el.contacts.length - 4)}</button>`

        }

        tdContactsType.append(tdContactsTypeDiv)
        tr.append(tdContactsType)

        const showMoreContacts = tdContactsTypeDiv.querySelectorAll('.showMoreContacts')
        console.log(showMoreContacts)
        showMoreContacts.forEach(el => {
            el.onclick = (e) => {
                console.log(e.target.parentNode, 'qwewqeqweqweq')
                tdContactsTypeDiv.querySelectorAll('.tooltip').forEach(el => {
                    el.classList.remove('none')
                })
                console.log(e.target)
                e.target.style = `
                display: none;
                `
            }
        })

        const tdButtons = document.createElement('td');
        tr.append(tdButtons)

        const buttonChangeClient = document.createElement('button');
        buttonChangeClient.innerHTML = 'Изменить';
        buttonChangeClient.style = `
        padding: 0;
        padding-left: 20px;
        margin-right: 20px;
        background-repeat: no-repeat;
        background-image: url(./img/edit.svg);
        border: none;
        font: inherit;
        color: inherit;
        background-color: transparent;
        cursor: pointer;
        `
        buttonChangeClient.onclick = () => {
            deleteContact(changeForm)
            openChangeModal(el)
        }
        tdButtons.append(buttonChangeClient);

        const deleteModal = document.querySelector('#deleteModal')
        const deleteInputCancel = document.querySelector('.deleteInputCancel')
        deleteInputCancel.onclick = () => deleteModal.close()

        const deleteButton = document.createElement('button')
        deleteButton.onclick = () => {
            deleteModal.showModal()
            const buttonDeleteClient = document.querySelector('#deleteClient')
            buttonDeleteClient.onclick = async () => {
                // removeClient(el.id)
                await deleteClient(el.id)
                findPropsAndFetch()
                deleteModal.close()
            }
        }

        deleteButton.innerHTML = 'Удалить'
        deleteButton.style = `
        padding: 0;
        border: none;
        padding-left: 20px;
        background-repeat: no-repeat;
        background-image: url(./img/cancel.svg);
        font: inherit;
        color: inherit;
        background-color: transparent;
        cursor: pointer;
        `

        tdButtons.append(deleteButton)
    })
}

// реализация поиска
const searchInput = document.querySelector('#searchInput')
let timerID;
searchInput.addEventListener('input', () => {
    clearTimeout(timerID)
    timerID = setTimeout(() => {
        // fetchClientsList(e.target.value)
        findPropsAndFetch()
    }, 300);
})





async function createSubmitHandler(e, submitCallBack, anyModal) {
    console.log(e.target)
    e.preventDefault();
    const formData = new FormData(e.target)
    const object = {};
    formData.forEach(function (value, key) {
        object[key] = value;
    });
    object.contacts = [];
    e.target.querySelectorAll('.selectContainer')?.forEach(divContacts => {
        const contactType = divContacts.querySelector('select').value
        const contactValue = divContacts.querySelector('input').value
        object.contacts.push({ type: contactType, value: contactValue })
    })
    await submitCallBack(object)
    findPropsAndFetch()
    anyModal.close()
    console.log(object)
}


// Добавление клиента


const addForm = document.querySelector('#addForm');
const inputAddSurname = document.querySelector('#inputAddSurname')
const inputAddFirstname = document.querySelector('#inputAddFirstname')
const createModal = document.querySelector('#createModal');
const validText = document.querySelector('.validText')


const addButton = document.querySelector('#addButton');
addButton.onclick = () => {
    deleteContact(addForm)
    validText.style = `visibility:hidden;`
    createModal.showModal();
    addForm.querySelectorAll('input').forEach(input => input.value = '')
}

function addContact(form, selectValue = 'Телефон', inputValue = '') {
    const contactsContainer = form.querySelector('.contactsContainer')

    const selectContainer = document.createElement('div');
    selectContainer.classList.add('selectContainer')
    selectContainer.style = `
        display:flex; min-width: 120px; margin-top:25px; background-color: #e7e5eb; border: 1px solid #c8c5d1;
        `;
    contactsContainer.append(selectContainer)

    const selectContact = document.createElement('select')
    selectContact.style = `
    min-width: 120px; background-color: #e7e5eb; border: 1px solid #c8c5d1;
    `
    selectContainer.append(selectContact)


    const optionTel = document.createElement('option')
    optionTel.value = 'Телефон'
    optionTel.textContent = optionTel.value;
    selectContact.append(optionTel)

    const optionEmail = document.createElement('option')
    optionEmail.textContent = 'E-mail'
    selectContact.append(optionEmail)

    const optionVk = document.createElement('option')
    optionVk.textContent = 'Vk'
    selectContact.append(optionVk)

    const optionFb = document.createElement('option')
    optionFb.textContent = 'FaceBook'
    selectContact.append(optionFb)

    const optionOther = document.createElement('option')
    optionOther.textContent = 'Другое'
    selectContact.append(optionOther)

    const selectInput = document.createElement('input')
    selectInput.value = inputValue
    selectInput.style = `
        background-color: #e5e5e5; border: 1px solid #c8c5d1;
        `;
    selectContainer.append(selectInput)

    const selectImgClose = document.createElement('img')
    selectImgClose.src = './img/delContact.svg'
    selectImgClose.style = `
        margin-left: -1px; cursor: pointer;
        `;
    selectImgClose.onclick = () => selectContainer.remove()
    selectContainer.append(selectImgClose)

    selectContact.value = selectValue
}

function deleteContact(form) {
    const contactsContainer = form.querySelector('.contactsContainer')
    contactsContainer.innerHTML = ''
}

const addFormAddContact = document.querySelector('#addFormAddContact')
addFormAddContact.addEventListener('click', () => addContact(addForm))

addForm.onsubmit = (e) => {
    if ((inputAddSurname.value != '') || (inputAddFirstname.value != '')) {
        createSubmitHandler(e, addClient, createModal)
    }
    else {
        validText.style = `visibility: visible; color: red;`
        e.preventDefault()
    }
}


const addInputCancel = document.querySelector('.addInputCancel')
addInputCancel.onclick = () => createModal.close()
const crossCreateModal = document.querySelector('#crossCreateModal')
crossCreateModal.onclick = () => createModal.close()
window.addEventListener('click', (e) => {
    if (e.target == createModal) createModal.close()
})

// Изменение клиента

const changeFormAddContact = document.querySelector('#changeFormAddContact')
changeFormAddContact.addEventListener('click', () => addContact(changeForm))

const changeModal = document.querySelector('#changeModal')

const changeForm = document.querySelector('#changeForm')

changeForm.onsubmit = async (e) => {
    createSubmitHandler(e, changeClient, changeModal)
}

async function openChangeModal(clientObject) {
    const { id, name, surname, lastName, contacts } = await getClient(clientObject.id)
    changeModal.showModal()
    const inputChangeSurname = document.querySelector('#inputChangeSurname')
    inputChangeSurname.value = surname;

    const inputChangeFirstname = document.querySelector('#inputChangeFirstname')
    inputChangeFirstname.value = name

    const inputChangeLastname = document.querySelector('#inputChangeLastname')
    inputChangeLastname.value = lastName

    const inputChangeID = document.querySelector('#inputChangeID');
    inputChangeID.value = id

    contacts.forEach(contactObject => {
        addContact(changeForm, contactObject.type, contactObject.value)
    })
}

const crossChangeModal = document.querySelector('#crossChangeModal')
crossChangeModal.onclick = () => changeModal.close()
window.addEventListener('click', (e) => {
    if (e.target == changeModal) changeModal.close()
})

const crossDeleteModal = document.querySelector('#crossDeleteModal')
crossDeleteModal.onclick = () => deleteModal.close()
window.addEventListener('click', (e) => {
    if (e.target == deleteModal) deleteModal.close()
})

// сортировка

function handlerHeaderClick(e) {

    if (e.target.classList.contains('sorted')) {
        if (e.target.classList.contains('reverseSorted')) {
            e.target.classList.remove('reverseSorted')

        } else {
            e.target.classList.add('reverseSorted')

        }
    } else {
        const bufer = document.querySelector('.sorted')
        bufer.classList.remove('sorted')
        bufer.classList.remove('reverseSorted')
        e.target.classList.add('sorted')
    }
    findPropsAndFetch();
}

const headerArray = [
    { id: 'headName', field: 'name' },
    { id: 'headID', field: 'id' },
    { id: 'headCreateDate', field: 'createdAt' },
    { id: 'headUpdateDate', field: 'updatedAt' },
]

headerArray.forEach(({ id }) => {
    document.querySelector(`#${id}`).addEventListener('click', (e) => {
        handlerHeaderClick(e)
    })
})

async function findPropsAndFetch() {
    let direct;
    const sortedElem = document.querySelector('.sorted')
    const foundHeader = headerArray.find(el => el.id == sortedElem.id)
    if (sortedElem.classList.contains('reverseSorted')) {
        direct = 'ASC'
    } else {
        direct = 'DESC'
    }
    const sortedData = await fetchClientsList(searchInput.value, foundHeader.field, direct)
    renderArray(sortedData)
}
findPropsAndFetch()
