// Testar cadastro com CPF e data de nascimento - CPF novo
const testCadastroWithNewCpf = async () => {
  console.log('🧪 Testando cadastro com CPF e data de nascimento (CPF novo)...\n');
  
  // Testar cadastro de atleta com CPF novo
  console.log('1️⃣ Testando cadastro de atleta com CPF novo...');
  try {
    const response = await fetch('http://localhost:3001/auth/register/atleta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Maria Teste Silva',
        email: 'maria.teste@example.com',
        password: 'senha123',
        cpf: '98765432100',
        dataNascimento: '1998-03-15',
        apelido: 'Maria Teste'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Atleta cadastrado com sucesso!');
      console.log('   ID:', data.id);
      console.log('   Nome:', data.name);
      console.log('   Email:', data.email);
      console.log('   CPF:', data.cpf);
      console.log('   Data Nascimento:', data.dataNascimento);
      console.log('   Role:', data.role);
      
      // Testar login com o novo usuário
      console.log('\n2️⃣ Testando login com o novo usuário...');
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
      } else {
        console.log('❌ Erro no login:', loginData.error);
      }
      
    } else {
      console.log('❌ Erro no cadastro:', data.error);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
  
  console.log('\n🎉 Teste de cadastro com CPF novo concluído!');
};

testCadastroWithNewCpf();