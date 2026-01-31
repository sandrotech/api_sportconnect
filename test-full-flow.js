// Testar o fluxo completo de recuperação de senha
const testFullFlow = async () => {
  console.log('🧪 Testando fluxo completo de recuperação de senha...\n');
  
  // 1. Testar verificação com dados corretos
  console.log('1️⃣ Testando verificação com dados corretos...');
  try {
    const verifyResponse = await fetch('http://localhost:3001/auth/verify-identity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cpf: '12345678901',
        dataNascimento: '1990-01-15',
        email: 'arena@sportconnect.com'
      })
    });

    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.ok) {
      console.log('✅ Verificação bem-sucedida!');
      console.log('   Token:', verifyData.token);
      console.log('   User ID:', verifyData.userId);
      
      // 2. Testar redefinição de senha
      console.log('\n2️⃣ Testando redefinição de senha...');
      const resetResponse = await fetch('http://localhost:3001/auth/reset-password-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: verifyData.userId,
          newPassword: 'novaSenhaSegura123'
        })
      });

      const resetData = await resetResponse.json();
      
      if (resetResponse.ok) {
        console.log('✅ Senha redefinida com sucesso!');
        console.log('   Mensagem:', resetData.message);
      } else {
        console.log('❌ Erro na redefinição:', resetData.error);
      }
    } else {
      console.log('❌ Erro na verificação:', verifyData.error);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
  
  // 3. Testar com dados incorretos
  console.log('\n3️⃣ Testando com dados incorretos...');
  try {
    const wrongResponse = await fetch('http://localhost:3001/auth/verify-identity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cpf: '00000000000',
        dataNascimento: '2000-01-01',
        email: 'naoexiste@email.com'
      })
    });

    const wrongData = await wrongResponse.json();
    
    if (!wrongResponse.ok) {
      console.log('✅ Validação funcionando corretamente!');
      console.log('   Erro esperado:', wrongData.error);
    } else {
      console.log('⚠️  Resposta inesperada:', wrongData);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
  
  console.log('\n🎉 Teste do fluxo completo concluído!');
};

testFullFlow();