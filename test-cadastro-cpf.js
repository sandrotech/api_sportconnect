// Testar cadastro com CPF e data de nascimento
const testCadastroWithCpf = async () => {
  console.log('🧪 Testando cadastro com CPF e data de nascimento...\n');
  
  // Testar cadastro de atleta
  console.log('1️⃣ Testando cadastro de atleta...');
  try {
    const response = await fetch('http://localhost:3001/auth/register/atleta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'João Teste Silva',
        email: 'joao.teste@example.com',
        password: 'senha123',
        cpf: '12345678901',
        dataNascimento: '1995-05-20',
        apelido: 'Joãozinho Teste'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Atleta cadastrado com sucesso!');
      console.log('   ID:', data.id);
      console.log('   Nome:', data.name);
      console.log('   CPF:', data.cpf);
      console.log('   Data Nascimento:', data.dataNascimento);
    } else {
      console.log('❌ Erro no cadastro:', data.error);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
  
  // Testar cadastro com CPF duplicado
  console.log('\n2️⃣ Testando cadastro com CPF duplicado...');
  try {
    const response = await fetch('http://localhost:3001/auth/register/atleta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'João Duplicado',
        email: 'joao.duplicado@example.com',
        password: 'senha123',
        cpf: '12345678901', // Mesmo CPF
        dataNascimento: '1990-01-15',
        apelido: 'João Dup'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.log('✅ Validação de CPF duplicado funcionando!');
      console.log('   Erro esperado:', data.error);
    } else {
      console.log('⚠️  CPF duplicado aceito - problema de segurança!');
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
  
  console.log('\n🎉 Teste de cadastro com CPF concluído!');
};

testCadastroWithCpf();