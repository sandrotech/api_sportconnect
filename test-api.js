// Testar a API de verificação de identidade
const testVerifyIdentity = async () => {
  try {
    console.log('🧪 Testando verificação de identidade...');
    
    const response = await fetch('http://localhost:3001/auth/verify-identity', {
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

    const data = await response.json();
    console.log('✅ Resposta da API:', data);
    
    if (response.ok) {
      console.log('🎉 Verificação bem-sucedida!');
      console.log('🔑 Token:', data.token);
      console.log('👤 User ID:', data.userId);
      
      // Testar redefinição de senha
      console.log('\n🧪 Testando redefinição de senha...');
      const resetResponse = await fetch('http://localhost:3001/auth/reset-password-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: data.userId,
          newPassword: 'novaSenha123'
        })
      });

      const resetData = await resetResponse.json();
      console.log('✅ Resposta da redefinição:', resetData);
      
      if (resetResponse.ok) {
        console.log('🎉 Senha redefinida com sucesso!');
      } else {
        console.log('❌ Erro na redefinição:', resetData.error);
      }
      
    } else {
      console.log('❌ Erro na verificação:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
};

testVerifyIdentity();