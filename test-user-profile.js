// Testar se CPF e data de nascimento estão no perfil do usuário
const testUserProfile = async () => {
  console.log('🧪 Testando perfil do usuário com CPF e data de nascimento...\n');
  
  // Fazer login para obter token
  console.log('1️⃣ Fazendo login...');
  try {
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'maria.teste@example.com',
        password: 'senha123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login bem-sucedido!');
      console.log('   Token:', loginData.token);
      console.log('   Usuário:', loginData.user.name);
      
      // Verificar se o CPF e data de nascimento estão no retorno
      console.log('\n2️⃣ Verificando dados do usuário...');
      console.log('   Nome:', loginData.user.name);
      console.log('   Email:', loginData.user.email);
      console.log('   Role:', loginData.user.role);
      
      // Como o login não retorna CPF e data de nascimento por segurança,
      // vamos testar a recuperação de senha para verificar se os dados estão corretos
      console.log('\n3️⃣ Testando recuperação de senha com os dados cadastrados...');
      const verifyResponse = await fetch('http://localhost:3001/auth/verify-identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: '98765432100',
          dataNascimento: '1998-03-15',
          email: 'maria.teste@example.com'
        })
      });

      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok) {
        console.log('✅ Dados verificados com sucesso!');
        console.log('   CPF e data de nascimento estão corretos no banco de dados!');
        console.log('   User ID:', verifyData.userId);
      } else {
        console.log('❌ Erro na verificação:', verifyData.error);
      }
      
    } else {
      console.log('❌ Erro no login:', loginData.error);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
  
  console.log('\n🎉 Teste de perfil concluído!');
};

testUserProfile();