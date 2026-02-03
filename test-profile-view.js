// Testar visualização do perfil com CPF e data de nascimento
const testProfileView = async () => {
  console.log('🧪 Testando visualização do perfil com CPF e data de nascimento...\n');
  
  // Fazer login para obter token
  console.log('1️⃣ Fazendo login...');
  try {
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'atleta@sportconnect.com',
        password: 'atleta123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Erro no login:', loginData.error);
      return;
    }
    
    console.log('✅ Login bem-sucedido!');
    console.log('   Token:', loginData.token);
    console.log('   Usuário:', loginData.user.name);
    
    // Verificar perfil
    console.log('\n2️⃣ Verificando perfil...');
    const profileResponse = await fetch('http://localhost:3001/atleta/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    const profileData = await profileResponse.json();
    
    if (profileResponse.ok) {
      console.log('✅ Perfil carregado com sucesso!');
      console.log('   Nome:', profileData.user.name);
      console.log('   Email:', profileData.user.email);
      console.log('   CPF:', profileData.user.cpf);
      console.log('   Data Nascimento:', profileData.user.dataNascimento);
      console.log('   Apelido:', profileData.apelido);
      console.log('   Telefone:', profileData.telefone);
      console.log('   Localização:', profileData.localizacao);
    } else {
      console.log('❌ Erro ao carregar perfil:', profileData.error);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
  
  console.log('\n🎉 Teste de visualização de perfil concluído!');
};

testProfileView();