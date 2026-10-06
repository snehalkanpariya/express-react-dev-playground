const express=require('express');
const app=express();
const port=3000;
const productRoutes=require('./routes/ProductRoutes');

app.use(express.json());
app.use('/api/products',productRoutes);

app.use((req,res,next,err)=>{
    console.error(err.stack);
    res.status(500).json({
        success:false,
        error:'Internal Server Error'
    })
})
app.get('/',(req,res)=>{
    res.send('Server is running!')
})

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});