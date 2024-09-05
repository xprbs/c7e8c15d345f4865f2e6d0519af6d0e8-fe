import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    Grid,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/router';
import { backendApi } from 'src/configs/axios';
import axios from 'axios';

const SUJFormRegistration = () => {
    const router = useRouter();
    const { id } = router.query;
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        productId: '',
        itemGroup: '',
        uom: '',
        type: '',
        category: '',
        description: '',
        subType: '',
        dimension: '',
        storage: '',
        reservation: '',
    });

    const [uomOptions, setUomOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [rawTypeOptions, setRawTypeOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);

    const getToken = async () => {
        const url = 'http://apidev.samora.co.id/api/samora-srv2/auth/login'
        try {
            const body = {
                username: 'samora-api',
                password: 'SamoraBer1'
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!response.ok) {
                throw new Error('Failed to fetch token')
            }
            const data = await response.json()

            return data.access_token
        } catch (error) {
            console.log('Error fetching data', error.message)
        }
    }

    const fetchUom = async (token) => {
        try {
            const url = "http://apidev.samora.co.id/api/samora-srv2/dynamic/master-data/UnitOfMeasure"

            const body = {
                dataAreaId: 'suj',
                UnitSymbol: '',
                TranslatedDescription: ''
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

                // body: JSON.stringify(body)

            })

            if (!response.ok) {
                throw new Error('Failed to fetch UOM')
            }

            const data = await response.json();
            
return data.data;

        } catch (error) {
            console.log('Failed to fetch UOM', error.message)
        }
    }

    const fetchType = async (token) => {
        try {
            const url = "http://apidev.samora.co.id/api/samora-srv2/dynamic/master-data/ProductCategories"

            const body = {
                dataAreaId: 'suj',
                UnitSymbol: '',
                TranslatedDescription: ''
            }

            const response = await axios(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: JSON.stringify(body)

            })

            if (response.status != 200) {
                throw new Error('Failed to fetch UOM')
            }
            const data = response.data.data;
            const uniqueParentCodes = new Set();

            const uniqueData = data.filter(item => {
                if (!uniqueParentCodes.has(item.ParentProductCategoryCode)) {
                    uniqueParentCodes.add(item.ParentProductCategoryCode);
                    
return true;
                }
                
return false;
            });
            setRawTypeOptions(data)
            
return uniqueData;

        } catch (error) {
            console.log('Failed to fetch UOM', error.message)
        }
    }


    const fetchCategories = async (token, parentCode) => {
        try {
            const url = `http://apidev.samora.co.id/api/samora-srv2/dynamic/master-data/ProductCategories`

            const response = await axios(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: JSON.stringify(body)

            })

            if (!response.ok) {
                throw new Error('Failed to fetch UOM')
            }

            const data = await response.json();
            
return data.data;

        } catch (error) {
            console.log('Failed to fetch UOM', error.message)
        }
    }



    const fetchData = async () => {
        setLoading(true);
        try {
            // Get token
            const token = await getToken();
            if (token) {
                const uom = await fetchUom(token);
                const type = await fetchType(token);
                setToken(token)
                setUomOptions(uom)
                setTypeOptions(type)
            }
            
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (isEdit) {
            // Fetch existing data to populate form
            backendApi.get(`/api/products/${id}`).then(response => setFormData(response.data));
        }
    }, [id]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleTypeChange = async (event) => {
        const { value } = event.target;
        setFormData(prevState => ({ ...prevState, type: value }));

        try {
            const data = rawTypeOptions;
            const filteredData = data.filter(item => item.ParentProductCategoryCode == value)
            console.log(filteredData)

            // const categories = await fetchCategories(token, value)
            // setCategoryOptions(categories);
            setCategoryOptions(filteredData)
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubTypeChange = (event) => {
        const { value } = event.target;
        setFormData(prevState => ({ ...prevState, subType: value }));

        if (value === 'ProductMaster') {
            setFormData(prevState => ({ ...prevState, dimension: 'Config | Size | Material/Color | Style' }));
        } else {
            setFormData(prevState => ({ ...prevState, dimension: '-' }));
        }
    };

    const handleSubmit = async (event, status) => {
        event.preventDefault();
        setLoading(true);

        try {
            const updatedFormData = { ...formData, status };
            if (isEdit) {
                await backendApi.put(`/api/products/${id}`, updatedFormData);
            } else {
                await backendApi.post('/api/products', updatedFormData);
            }
            router.push('/items');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAndSubmit = async (event) => {
        event.preventDefault();
        const updatedFormData = { ...formData, status_cotte: 1 };
        setLoading(true);

        try {
            if (isEdit) {
                await backendApi.put(`/api/products/${id}`, updatedFormData);
            } else {
                await backendApi.post('/api/products', updatedFormData);
            }
            router.push('/items');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Box p={4}>
                <Typography variant='h5' gutterBottom>
                    {isEdit ? 'Edit Item' : 'Create Item'}
                </Typography>
                <form onSubmit={(e) => handleSubmit(e, 1)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label='Product ID'
                                name='productId'
                                value={formData.productId}
                                onChange={handleInputChange}
                                InputProps={{ readOnly: true }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Sub Type</InputLabel>
                                <Select
                                    label='Sub Type'
                                    name='sub_type'
                                    value={formData.sub_type}
                                    onChange={handleSubTypeChange}
                                >
                                    <MenuItem value='ProductMaster'>Product Master</MenuItem>
                                    <MenuItem value='Product'>Product</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>UOM</InputLabel>
                                <Select
                                    name='uom'
                                    value={formData.uom}
                                    onChange={handleInputChange}
                                >
                                    {uomOptions.map(uom => (
                                        <MenuItem key={uom.UnitSymbol} value={uom.UnitSymbol}>
                                            {uom.TranslatedDescription}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name='type'
                                    value={formData.type}
                                    onChange={handleTypeChange}
                                >
                                    {typeOptions && typeOptions.map(type => (
                                        <MenuItem key={type.ParentProductCategoryCode} value={type.ParentProductCategoryCode}>
                                            {type.ParentProductCategoryName} - {type.ParentProductCategoryCode}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name='category'
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    {categoryOptions.map(category => (
                                        <MenuItem key={category.CategoryCode} value={category.CategoryCode}>
                                            {category.CategoryName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label='Description'
                                name='description'
                                value={formData.description}
                                onChange={(event) => handleInputChange({
                                    ...event,
                                    target: { ...event.target, value: event.target.value.toUpperCase() },
                                })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Sub Type</InputLabel>
                                <Select
                                    name='subType'
                                    value={formData.subType}
                                    onChange={handleSubTypeChange}
                                >
                                    <MenuItem value='ProductMaster'>Product Master</MenuItem>
                                    <MenuItem value='Product'>Product</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Dimension</InputLabel>
                                <Select
                                    name='dimension'
                                    value={formData.dimension}
                                    onChange={handleInputChange}
                                    readOnly
                                >
                                    <MenuItem value='Config | Size | Material/Color | Style'>Config | Size | Material/Color | Style</MenuItem>
                                    <MenuItem value='-'>-</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Storage</InputLabel>
                                <Select
                                    name='storage'
                                    value={formData.storage}
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value='Yes'>Yes</MenuItem>
                                    <MenuItem value='No'>No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Reservation</InputLabel>
                                <Select
                                    name='reservation'
                                    value={formData.reservation}
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value='Yes'>Yes</MenuItem>
                                    <MenuItem value='No'>No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} display='flex' justifyContent='space-between'>
                            <Button variant='outlined' onClick={() => router.push('/item/anf-registration')}>
                                Back
                            </Button>
                            <Box>
                                <Button variant='contained' color='primary' type='submit' disabled={loading}>
                                    Save
                                    {loading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                                </Button>
                                <Button
                                    variant='contained'
                                    color='info'
                                    onClick={handleSaveAndSubmit}
                                    disabled={loading}
                                    sx={{ ml: 2 }}
                                >
                                    Save & Submit for Approval
                                    {loading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Card>
    );
};

SUJFormRegistration.acl = {
    action: 'manage',
    subject: 'anf-fico-approval-form'
};

export default SUJFormRegistration;
