// Testar atualização de perfil com CPF e data de nascimento
const testProfileUpdate = async () => {
  console.log('🧪 Testando atualização de perfil com CPF e data de nascimento...\n');
  
  // Primeiro fazer login para obter token
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
    
    // Testar atualização de perfil
    console.log('\n2️⃣ Testando atualização de perfil...');
    const updateResponse = await fetch('http://localhost:3001/atleta/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        name: 'João Silva Atualizado',
        cpf: '98765432109',
        dataNascimento: '1995-05-20',
        apelido: 'Joãozinho Atualizado',
        telefone: '(11) 99999-9999',
        localizacao: 'São Paulo, SP'
      })
    });

    const updateData = await updateResponse.json();
    
    if (updateResponse.ok) {
      console.log('✅ Perfil atualizado com sucesso!');
      console.log('   Nome:', updateData.user.name);
      console.log('   CPF:', updateData.user.cpf);
      console.log('   Data Nascimento:', updateData.user.dataNascimento);
      console.log('   Apelido:', updateData.apelido);
    } else {
      console.log('❌ Erro na atualização:', updateData.error);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
  
  console.log('\n🎉 Teste de atualização de perfil concluído!');
};

testProfileUpdate();