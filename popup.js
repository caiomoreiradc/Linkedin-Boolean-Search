document.getElementById('searchButton').addEventListener('click', function() {

    // Obter os valores digitados
    const jobTitles = document.getElementById('jobTitle').value.split(',').map(title => title.trim()).filter(title => title !== '');
    var jobLevel = document.getElementById('experienceLevel').value;
    const jobIgnore = document.getElementById('jobIgnore').value.split(',').map(ignore => ignore.trim()).filter(ignore => ignore !== '');
    // Obter Checkboxes
    const remoteOnly = document.getElementById('remote').checked;
    const candidaturaSimplificada = document.getElementById('simplificada').checked;
    //geoId do Brasil
    const isBrasil = 106057199

    // Adicionar geoId para buscar vagas  por  país
    var geoId = document.getElementById('countryId').value;    

    // Validação
    if (jobTitles.length === 0 || !jobLevel) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return; // Não prosseguir com a ação se a validação falhar
    }

    //Configurando para Inglês nível do cargo caso seja fora do Brasil a vaga
    if (geoId !== isBrasil) 
    { 
        if (jobLevel === 'estágio') {
            jobLevel = 'intern';
        }
    
        if (jobLevel === 'pleno') {
            jobLevel = '';
        }
    }

    //Define a query padrão
    var booleanSearch = jobTitles.map(title => `"${title}" AND ${jobLevel}`).join(' OR ');

    //Modificar o query para pleno gringo pois lá não se falan "pleno" apenas "Developer" por exemplo
    if(geoId !== isBrasil && jobLevel === '') //jobLevel é pleno
    {
        booleanSearch = jobTitles.map(title => `"${title}"`).join(' OR ');
    }
    
    //Define variável searchQuery
    let searchQuery = `${booleanSearch}`;

    //Adiciona Remoto na query
    if (remoteOnly === true && geoId !== isBrasil) 
    {
        searchQuery += ' AND remote';
    } 
    else if (remoteOnly) 
    {
        searchQuery += ' AND remoto';
    }

    // Adicionar 'AND NOT' se houver valores no campo jobIgnore
    if (jobIgnore.length > 0) {
        const ignoreSearch = jobIgnore.map(ignore => `"${ignore}"`).join(' OR ');
        searchQuery += ` AND NOT (${ignoreSearch})`;
    }

    // criar url

    let url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchQuery)}&geoId=${encodeURIComponent(geoId)}`

    //adicionar candidatura simplificada na url caso marcado a checkbox
    if(candidaturaSimplificada)
    {
        url += '&f_AL=true';
    }

    //Criar aba
    chrome.tabs.create({ url: url });
});
