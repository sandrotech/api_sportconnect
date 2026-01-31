// Testar a API com dados incorretos
const testVerifyIdentityWithWrongData = async () => {
  try {
    console.log('🧪 Testando verificação com dados incorretos...');
    
    const response = await fetch('http://localhost:3001/auth/verify-identity', {
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

    const data = await response.json();
    console.log('✅ Resposta da API:', data);
    
    if (!response.ok) {
      console.log('🎉 Validação funcionando corretamente!');
      console.log('❌ Erro esperado:', data.error);
    } else {
      console.log('⚠️  Resposta inesperada:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
};

testVerifyIdentityWithWrongData();