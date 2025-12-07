import bcrypt from 'bcrypt'

console.log('Testing bcrypt...')
bcrypt.hash('test', 10).then(hash => {
    console.log('Hash created:', hash)
}).catch(err => {
    console.error('Bcrypt error:', err)
})
